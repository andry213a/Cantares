# Cantares

Aplicacion de mensajeria en tiempo real con chat global, chats privados y grupos. Incluye perfiles personalizables, solicitudes de amistad, invitaciones, notas de voz, archivos, reacciones y mas.

## Funciones principales
- Registro y login con sesiones.
- Chat global, chats privados y grupos.
- Solicitudes de amistad e invitaciones a grupos.
- Mensajes en tiempo real (texto, voz, archivos).
- Reacciones rapidas y respuestas (reply).
- Mensajes temporales por chat.
- Encuestas y eventos en grupos.
- Perfiles con temas, avatar, estado y opciones de personalizacion.
- Vista de archivos compartidos.
- Notificaciones sonoras configurables.

## Requisitos
- Node.js 18+ recomendado (ideal 20 LTS).

## Instalacion
```bash
npm install
```

## Ejecutar en local
```bash
npm start
```
Abre `http://localhost:3000` en tu navegador.

## Estructura basica
```
public/
  index.html
  styles.css
  app.js
server.js
cantares.json
```

## Datos
Por defecto usa JSON, pero puedes usar SQLite o Postgres para produccion.

- JSON: `cantares.json`
- SQLite: `cantares.sqlite`
- Postgres: `DATABASE_URL`

### Variables de entorno
Archivo de ejemplo: `.env.example`

- `PORT=3000`
- `NODE_ENV=production`
- `DATA_DIR=.` (ruta donde se guardan archivos)
- `DB_BACKEND=json` o `sqlite` o `postgres`
- `DB_FILE=./cantares.sqlite`
- `DATABASE_URL=postgres://user:password@host:5432/dbname`

### Limites anti-spam
- Registro: 10 intentos por 30 minutos por IP.

## Notas
- Si algo no aparece o ocurre un error visual, recarga la pagina.
- El tamano maximo de archivo es 5MB.

## Subir a GitHub
```bash
git init
git add .
git commit -m "primer commit"
```
Luego crea un repo en GitHub y sigue las instrucciones para hacer `git push`.

## Deploy en Render (dominio gratis)
1. Sube el repo a GitHub.
2. En Render crea un **Web Service** desde tu repo.
3. Start command: `npm start`
4. Agrega un **Disco Persistente** y monta en `DATA_DIR` (por ejemplo `/data`).
5. Variables de entorno recomendadas:
   - `NODE_ENV=production`
   - `DB_BACKEND=postgres`
   - `DATABASE_URL=...`
6. Render te da un dominio gratis tipo `tu-app.onrender.com`.

Si quieres usar dominio propio, puedes apuntar un dominio comprado a Render desde la seccion de dominios del servicio.

## Licencia
Uso personal o educativo.
