// ===============================
//  VARIABLES DE ENTRADA
// ===============================
// pctPower : potencia relativa [0..1]
// mixture  : mezcla normalizada [0..1] (0 = muy rica, 0.5 = peak, 1 = muy pobre)
// IAS      : velocidad indicada en nudos (knots)
// dt       : delta time del frame (segundos)

// ===============================
//  COEFICIENTES AJUSTABLES
// ===============================
const float C0 = 230.0f;   // CHT base en °F
const float C1 = 171.0f;   // efecto de potencia en °F
const float C2 = 45.0f;    // efecto de mezcla (peak) en °F
const float C3 = 0.396f;   // enfriamiento por velocidad (°F por knot)

// Límites operativos CHT (°F)
const float CHT_MIN_F = 140.0f;
const float CHT_MAX_F = 500.0f;

// Constante de tiempo (respuesta lenta)
const float alphaCHT = 0.03f;   // 0.02–0.05 recomendado

// ===============================
//  ESTADO DEL INSTRUMENTO
// ===============================
float CHT = 280.0f;   // valor inicial típico en °F

float clampf(float value, float minValue, float maxValue)
{
    if (value < minValue) return minValue;
    if (value > maxValue) return maxValue;
    return value;
}

// ===============================
//  FUNCIÓN DE MEZCLA (pico en 0.5)
// ===============================
float mixtureEffect(float phi)
{
    // g(phi) = 1 - 4*(phi - 0.5)^2
    float phiClamped = clampf(phi, 0.0f, 1.0f);
    float d = phiClamped - 0.5f;
    return 1.0f - 4.0f * (d * d);
}

// ===============================
//  ACTUALIZACIÓN DE CHT POR FRAME
// ===============================
void updateCHT(float pctPower, float mixture, float IAS, float dt)
{
    float powerClamped = clampf(pctPower, 0.0f, 1.0f);
    float iasClamped = clampf(IAS, 0.0f, 220.0f);
    float dtClamped = clampf(dt, 0.0f, 0.2f);

    // 1) Calcular efecto de mezcla
    float g = mixtureEffect(mixture);

    // 2) Calcular CHT objetivo
    float CHT_target =
        C0 +
        C1 * powerClamped +
        C2 * g -
        C3 * iasClamped;

    // 3) Integración lenta hacia el objetivo
    CHT += (CHT_target - CHT) * alphaCHT * dtClamped;

    // 4) Limitar CHT a rango operativo
    CHT = clampf(CHT, CHT_MIN_F, CHT_MAX_F);
}
