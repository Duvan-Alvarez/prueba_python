export interface Ejercicio {
  numero: 1 | 2 | 3;
  titulo: string;
  consigna: string;
  solucion_referencia: string;
  rubrica: { criterio: string; porcentaje: number }[];
  peso: number;
  tiempo_sugerido: number;
}

export const EJERCICIOS: Record<1 | 2 | 3, Ejercicio> = {
  1: {
    numero: 1,
    titulo: 'Limpieza y facturación del período',
    consigna: `Recibes ventas.csv del área comercial. Antes de reportar cualquier cifra, necesitas confirmar que los datos son confiables.
1. Carga los datos y elimina duplicados exactos.
2. Estandariza la columna fecha a un único formato datetime.
3. Decide y aplica un tratamiento razonable para los valores nulos en costo_unitario (justifica tu decisión en la celda de interpretación).
4. Calcula el ingreso total (cantidad multiplicado por precio_unitario) del dataset ya limpio.`,
    solucion_referencia: `import pandas as pd

df = pd.read_csv('ventas.csv')

n_dup = df.duplicated().sum()
df = df.drop_duplicates()

df['fecha'] = pd.to_datetime(df['fecha'], format='mixed', dayfirst=True, errors='coerce')

n_nulos = df['costo_unitario'].isna().sum()
df['costo_unitario'] = df.groupby('id_producto')['costo_unitario'] \\
    .transform(lambda x: x.fillna(x.median()))
df['costo_unitario'] = df['costo_unitario'].fillna(df['costo_unitario'].median())

df['ingreso'] = df['cantidad'] * df['precio_unitario']
print(f"Duplicados eliminados: {n_dup}")
print(f"Nulos en costo_unitario tratados: {n_nulos}")
print(f"Ingreso total: \${df['ingreso'].sum():,.2f}")`,
    rubrica: [
      { criterio: 'Detección y eliminación correcta de duplicados, y estandarización correcta de fechas', porcentaje: 35 },
      { criterio: 'Tratamiento justificado de los valores nulos (no solo ejecutado, sino explicado en la interpretación)', porcentaje: 35 },
      { criterio: 'Cálculo correcto del ingreso total', porcentaje: 30 },
    ],
    peso: 0.25,
    tiempo_sugerido: 12,
  },
  2: {
    numero: 2,
    titulo: 'Rentabilidad por producto y segmento de cliente',
    consigna: `El CFO quiere saber qué está generando (o destruyendo) valor: productos y segmentos de cliente. Continúa trabajando sobre el dataset ya limpio del ejercicio anterior.
1. Calcula el margen (ingreso menos cantidad multiplicada por costo_unitario) y el porcentaje de margen por transacción.
2. Identifica los 3 productos más rentables y los 3 menos rentables, usando productos.csv para mostrar sus nombres.
3. Usando clientes.csv, identifica qué segmento (Retail, Corporativo o PyME) genera más margen total y más margen por cliente.
4. En la celda de interpretación, en 3-4 líneas: ¿qué acción concreta recomendarías al equipo comercial con base en estos hallazgos?`,
    solucion_referencia: `productos = pd.read_csv('productos.csv')
clientes = pd.read_csv('clientes.csv')

df['margen'] = df['ingreso'] - (df['cantidad'] * df['costo_unitario'])
df['pct_margen'] = df['margen'] / df['ingreso']

resumen_prod = df.groupby('id_producto')['margen'].sum() \\
    .reset_index().merge(productos, on='id_producto') \\
    .sort_values('margen', ascending=False)

top3 = resumen_prod.head(3)
bottom3 = resumen_prod.tail(3)

df_full = df.merge(clientes, on='id_cliente')
resumen_seg = df_full.groupby('segmento').agg(
    margen_total=('margen', 'sum'),
    n_clientes=('id_cliente', 'nunique')
)
resumen_seg['margen_por_cliente'] = resumen_seg['margen_total'] / resumen_seg['n_clientes']`,
    rubrica: [
      { criterio: 'Cálculo correcto de margen y porcentaje de margen', porcentaje: 20 },
      { criterio: 'Ranking correcto de productos más y menos rentables', porcentaje: 25 },
      { criterio: 'Análisis correcto por segmento usando merge con clientes.csv', porcentaje: 25 },
      { criterio: 'Calidad y accionabilidad de la recomendación de negocio', porcentaje: 30 },
    ],
    peso: 0.35,
    tiempo_sugerido: 15,
  },
  3: {
    numero: 3,
    titulo: 'Mini reporte ejecutivo',
    consigna: `Debes enviar un resumen breve al Comité Comercial. No tienen tiempo de leer código.
1. Calcula 3 KPIs del período: ingreso total, porcentaje de margen total, y ticket promedio.
2. Construye una serie de ingreso mensual y calcula el porcentaje de crecimiento del último mes disponible respecto al mes anterior.
3. Elige una visualización que consideres más útil para el comité (por ejemplo ingreso por región, por canal, o la serie mensual) y justifica en 1 línea por qué la elegiste.
4. En la celda de interpretación, redacta un resumen ejecutivo de 4-6 líneas: desempeño general, el hallazgo más relevante, y una recomendación priorizada.`,
    solucion_referencia: `import matplotlib.pyplot as plt

kpis = {
    'Ingreso total': df['ingreso'].sum(),
    '% Margen': df['margen'].sum() / df['ingreso'].sum() * 100,
    'Ticket promedio': df['ingreso'].mean(),
}

df['mes'] = df['fecha'].dt.to_period('M')
serie_mensual = df.groupby('mes')['ingreso'].sum().sort_index()
crecimiento_ultimo_mes = serie_mensual.pct_change().iloc[-1] * 100

ingreso_region = df.groupby('region')['ingreso'].sum().sort_values(ascending=False)
ingreso_region.plot(kind='bar', title='Ingreso por región')
plt.show()`,
    rubrica: [
      { criterio: 'KPIs correctos', porcentaje: 20 },
      { criterio: 'Cálculo correcto del crecimiento mensual', porcentaje: 15 },
      { criterio: 'Visualización bien elegida y justificada', porcentaje: 20 },
      { criterio: 'Claridad, priorización y lenguaje de negocio del resumen ejecutivo', porcentaje: 45 },
    ],
    peso: 0.4,
    tiempo_sugerido: 18,
  },
};

export const INSTRUCCIONES_GENERALES = `Esta prueba consta de 3 ejercicios de análisis de datos con Python y pandas, diseñada para completarse en 45 minutos. Trabajarás sobre tres datasets ya cargados: ventas.csv, clientes.csv y productos.csv. Puedes usar documentación oficial de pandas, pero no está permitido el uso de asistentes de inteligencia artificial generativa (ChatGPT, Copilot, Claude u otros) durante la prueba. En cada ejercicio, la interpretación de negocio que escribas en la celda de texto tiene tanto o más peso que el código: se evalúa tu capacidad de traducir datos en decisiones, no solo tu dominio de sintaxis. El cronómetro iniciará al presionar 'Comenzar' y tu trabajo se enviará automáticamente al agotarse el tiempo.`;
