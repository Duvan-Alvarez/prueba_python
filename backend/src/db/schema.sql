-- Tabla de candidatos
CREATE TABLE IF NOT EXISTS candidatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    token_acceso TEXT NOT NULL UNIQUE,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pruebas
CREATE TABLE IF NOT EXISTS pruebas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidato_id INTEGER NOT NULL,
    estado TEXT DEFAULT 'no_iniciada',
    iniciada_en DATETIME,
    entregada_en DATETIME,
    tiempo_limite_segundos INTEGER DEFAULT 2700,
    FOREIGN KEY(candidato_id) REFERENCES candidatos(id)
);

-- Tabla de respuestas
CREATE TABLE IF NOT EXISTS respuestas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prueba_id INTEGER NOT NULL,
    ejercicio_numero INTEGER NOT NULL,
    codigo TEXT,
    output_ejecucion TEXT,
    interpretacion_texto TEXT,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(prueba_id) REFERENCES pruebas(id)
);

-- Tabla de eventos de actividad
CREATE TABLE IF NOT EXISTS eventos_actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prueba_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    detalle TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(prueba_id) REFERENCES pruebas(id)
);

-- Tabla de calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prueba_id INTEGER NOT NULL,
    ejercicio_numero INTEGER NOT NULL,
    criterio TEXT NOT NULL,
    puntaje_ia REAL,
    puntaje_final REAL,
    comentario_evaluador TEXT,
    calificado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(prueba_id) REFERENCES pruebas(id)
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_candidatos_token ON candidatos(token_acceso);
CREATE INDEX IF NOT EXISTS idx_pruebas_candidato ON pruebas(candidato_id);
CREATE INDEX IF NOT EXISTS idx_pruebas_estado ON pruebas(estado);
CREATE INDEX IF NOT EXISTS idx_respuestas_prueba ON respuestas(prueba_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_prueba ON calificaciones(prueba_id);
