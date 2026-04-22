1/15/2026
Arzamendia Systems

El NewServerRouter permite conectarse con un
proovedor de Internet.

Almacena el nombre del proveedor y password en la ESP32.

Luego muestra la página de Internet para su trabajo normal
a travez del router al que se conecta.

Para poder conectarse a la página de servicio

IP: 192.168.100.34

2026-02-07 14:50:59
Esta es la tercer versión del Tablero de Instrumentos Aeronáuticos
------------------------------------------------------------------

Las versiones anteriores fallaban por no tener un patron estable
para la instalación de nuevos instrumentos. De esta forma ninguno
de los instrumentos y controles instalados funciona de la misma
forma que ningún otro instrumento. Esto hace que se multipliquen 
los problemas, y que arreglar un instrumento, significaba crear
mal funcionamiento en alguno de los otros instrumentos.

La solución para esto es establecer una forma clara de incorporar
instrumentos en el tablero. 

1 - Cada instrumento dipondrá de una celda en la grilla del tablero,
    con el CSS que le corresponda. Permitiendo sacar y poner instru-
    mentos, sin preocuparse por el formato y estilo. Tendrán su propio
    JS para leer los valores que tiene que mostrar desde el ESP32. Las
    funciones solo van a servir para recibir los valores a mostrar, y 
    mostrarlos.

2 - Los controles de cada instrumento, estaran en una celda de la 
    grilla, separados de los instrumentos. Tendrán su propio CSS y JS.
    Lo que tendran que hacer los controles es leer los slider y 
    botones, y transmitir los valores al ESP32. 

3 - El programa .ino es el que recibirá todos los valores de los 
    controles del tablero. Se encargará de hacer los cálculos que 
    correspondan, y luego broadcast los valores a las terminales.

4 - El programa mainHTML.cpp será el encargado de mantener el WebSocket
    abierto para comunicarse con los instrumentos que tienen que mostrar
    el nuevo valor. Simple, y directo.

5 - Los nombre de instrumentos será:
        - variometer_Instrument.html
        - variometer_Controls.html
    Indicando el nombre del instrumento primero, y luego separado por "_" 
    su trabajo específico.

6 - Se incorporará como standard, una página con la información del conex-
    cionado del GPIO para cada instrumento.



