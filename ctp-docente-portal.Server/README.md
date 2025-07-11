# 🛠️ Proyecto ASP.NET Core - Conexión Segura a Base de Datos

Este proyecto utiliza ASP.NET Core y PostgreSQL para la conexión a base de datos.  
Se sigue una estrategia segura para manejar credenciales sin comprometer la seguridad del repositorio.

---

## 📦 Contenido del Repositorio

- `Program.cs` – Configura la aplicación y la base de datos.
- `appsettings.json` – Configuración general **sin secretos**.
- Archivos de código fuente (controladores, modelos, etc.).

---

## 🔐 Configuración Segura (User Secrets)

### 🚫 **¡Importante!**
No debes almacenar contraseñas, cadenas de conexión ni otros secretos en archivos públicos como `appsettings.json` o subirlos al repositorio.

---

## 👩‍💻 Para desarrolladores del equipo

Cada desarrollador debe configurar su propia cadena de conexión local usando **User Secrets** de Visual Studio:

### 1. Habilita User Secrets
- Clic derecho sobre el proyecto en Visual Studio.
- Selecciona: **Manage User Secrets** o **Administrar secretos de usuario** según el idioma que corresponda.

### 2. Agrega tu cadena de conexión
En el archivo `secrets.json` que se abre, pega lo siguiente con tus propios datos:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=ctp_develop_tunombre;Username=tuusuario;Password=tucontraseña"
  }
}
````

Cada desarrollador puede tener su propia base de datos local para evitar conflictos.

---

## 🌐 Configuración en Producción

En entornos como **Render**, **Azure**, **Heroku**, etc., debes definir una **variable de entorno**:

* **Nombre:** `ConnectionStrings__DefaultConnection`
* **Valor:** tu cadena de conexión completa de producción

Esto permite mantener los secretos fuera del código.

---

## ✅ Estructura de `appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": ""
  }
}
```

No modifiques esto para agregar tu cadena local.

---

## 📂 .gitignore recomendado

Asegúrate de tener en tu `.gitignore` las siguientes líneas:

```
appsettings.Development.json
.env
secrets.json
```

---

## 🧪 ¿Cómo saber si estás en modo desarrollo?

ASP.NET Core automáticamente detecta el entorno desde la variable `ASPNETCORE_ENVIRONMENT`.
Por defecto, en Visual Studio, es `Development`, y ya carga los **User Secrets**.

---

## 📞 Soporte

Si tienes dudas o errores al conectar tu base de datos local, contacta con el líder técnico o revisa las instrucciones en este README.

---
