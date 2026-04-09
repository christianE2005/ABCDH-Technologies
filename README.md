# ABCDH Technologies Frontend

Frontend hecho con React + Vite + TypeScript.

## Scripts

- `npm run dev`: desarrollo local
- `npm run build`: build de producción (TypeScript + Vite)
- `npm run preview`: previsualizar build con Vite
- `npm start`: servir `dist` en producción (usa `PORT` automáticamente)

## Deploy en Railway

Este repo ya incluye `railway.toml` para que Railway detecte comandos:

- Build command: `npm run build`
- Start command: `npm start`

### Pasos

1. Sube estos cambios a tu repositorio (`git push`).
2. En Railway, crea un nuevo proyecto y conecta tu repo.
3. Railway tomará `railway.toml` automáticamente.
4. Espera el build y abre el dominio generado.

## Nota importante

Se corrigió un error de TypeScript en `src/app/pages/ProjectDetail.tsx` (import no usado: `MessageCircle`) que estaba rompiendo `npm run build` en Railway.
