1/15/2026
Arzamendia Systems

El NewServerRouter permite conectarse con un
proovedor de Internet.

Almacena el nombre del proveedor y password en la ESP32.

Luego muestra la página de Internet para su trabajo normal
a travez del router al que se conecta.

Para poder conectarse a la página de servicio

IP: 192.168.100.34


Estos son los dos instrumentos (altimetro y velocidad vertical) que terminamos hace unos días. Los cambios que hay que hacer es:

1 - Dividir la página en 4 líneas por 8 columnas, celdas cuadradas, todas del mismo      tamaño.
2 - En la fila cero, columna 2, vas a acomodar todos los gráficos del altímetro.
3 - En la fila uno, columna 2, vas a acomodar todos los gráficos del velocidad vertical.
4 - El Slider de este sistema lo vas a acomodar en forma vertical, entre las filas 1 y 2, en la columna 5.


Disposición de los instrumentos en la grilla:

Row 1, Col 2 --- Attitude Control
Row 1, Col 3 --- Altimeter
Row 1, Col 4 --- RPM
Row 2, Col 3 --- Vertical Speed
Row 2, Col 4 --- Fuel Flow

All the sliders are going to be in the Row 2, Col 6, and up