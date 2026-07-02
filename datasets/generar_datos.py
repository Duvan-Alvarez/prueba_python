import pandas as pd
import numpy as np

np.random.seed(42)

categorias = ['Electrónica', 'Hogar', 'Oficina', 'Alimentos']
productos = pd.DataFrame({
    'id_producto': range(1, 41),
    'nombre_producto': [f'Producto {i}' for i in range(1, 41)],
    'categoria': np.random.choice(categorias, 40)
})

segmentos = ['Retail', 'Corporativo', 'PyME']
clientes = pd.DataFrame({
    'id_cliente': range(1, 301),
    'nombre_cliente': [f'Cliente {i}' for i in range(1, 301)],
    'segmento': np.random.choice(segmentos, 300, p=[0.5, 0.2, 0.3]),
    'fecha_alta': pd.date_range('2022-01-01', periods=300, freq='3D')
})

n = 2000
fechas = pd.date_range('2025-10-01', '2026-03-31', periods=n)
ventas = pd.DataFrame({
    'id_venta': range(1, n + 1),
    'fecha': fechas,
    'id_cliente': np.random.choice(clientes['id_cliente'], n),
    'id_producto': np.random.choice(productos['id_producto'], n),
    'cantidad': np.random.randint(1, 50, n),
    'precio_unitario': np.round(np.random.uniform(10, 500, n), 2),
    'region': np.random.choice(['Norte', 'Sur', 'Centro', 'Oriente'], n),
    'canal': np.random.choice(['Online', 'Tienda', 'Distribuidor'], n),
})
ventas['costo_unitario'] = np.round(ventas['precio_unitario'] * np.random.uniform(0.5, 0.85, n), 2)

ventas.loc[ventas.sample(frac=0.04, random_state=1).index, 'costo_unitario'] = np.nan
ventas.loc[ventas.sample(frac=0.03, random_state=2).index, 'region'] = np.nan
dup_idx = ventas.sample(12, random_state=3).index
ventas = pd.concat([ventas, ventas.loc[dup_idx]], ignore_index=True)

ventas['fecha'] = ventas['fecha'].astype(str)
mask_formato = ventas.sample(frac=0.5, random_state=4).index
ventas.loc[mask_formato, 'fecha'] = pd.to_datetime(
    ventas.loc[mask_formato, 'fecha']
).dt.strftime('%d/%m/%Y')

ventas.to_csv('datasets/ventas.csv', index=False)
clientes.to_csv('datasets/clientes.csv', index=False)
productos.to_csv('datasets/productos.csv', index=False)

print("Filas ventas:", len(ventas))
print("Filas clientes:", len(clientes))
print("Filas productos:", len(productos))
