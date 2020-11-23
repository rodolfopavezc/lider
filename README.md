# Desafío Lider
Se necesita una Aplicación Web que contenga un buscador y una sección de resultados para
listar los productos encontrados desde una base de datos en mongo
(https://github.com/walmartdigital/products-db). En caso de que la búsqueda sea un
palíndromo se deberá retornar los productos con el descuento (50%) ya aplicado al precio.

##Requerimientos
- Si desea utilizar el archivo Dockerfile, necesita previamente tener instalado Docker
- En caso de utilizar directamente el codigo python, necesita contar con una versión de python 3.x .Se recomienda el uso de la versión 3.6  

### Instalación usando Docker
En la raiz del proyecto se encuentra el archivo Dockerfile, con el cual se puede iniciar la aplicación por medio de Docker.

### Instalación usando Python 
En caso de necesitar arrancar de forma directa con python el proyecto, se deben realizar los siguientes pasos:
1) Se recomienda generar un entorno virtual sobre python 3.6
2) Ingresar a la carpeta 'code' del proyecto 
`cd code/`
3) Instalar los paquetes necesarios.
`pip3 install -r requirements.txt`
4) Ejecutar la aplicación, la cual levantará por defecto el servicio sobre el puerto 5000.
`python app.py`
5) Posteriormente, entrar al navegador e ingresar a la url: http://localhost:5000

### Testing
Para ejecutar las pruebas asociadas, se debe estar en la raiz del proyecto y ejecutar la siguiente linea:
 `python -m unittest code/test/test_app.py`