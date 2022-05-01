# Instalar Vite
```bash
npm create vite@latest
cd APP_NAME
npm install
```

# Instalar MUI
```bash
npm install @mui/material @emotion/react @emotion/styled
```

# Instalar CapacitorJS
```bash
npm install @capacitor/core @capacitor/cli
npx cap init # Al ejecutar esto, indicar carpeta 'dist' como directorio
npm install @capacitor/android
npx cap add android
```

# Ejecutar app
```bash
npm run dev
```

# Abrir proyecto android stutio
```bash
export CAPACITOR_ANDROID_STUDIO_PATH="/home/matias/Programas/android-studio/bin/studio.sh" 
npx cap open android 
```