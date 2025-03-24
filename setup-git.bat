@echo off
echo Inicializando repositorio Git para Olimpo Next.js...
git init
echo Agregando archivos al repositorio...
git add .
echo Realizando commit inicial...
git commit -m "Migración inicial de React a Next.js"
echo.
echo =============================================
echo Repositorio Git inicializado correctamente!
echo.
echo Ahora puedes conectar este repositorio a GitHub con los siguientes comandos:
echo.
echo git remote add origin https://github.com/tu-usuario/olimpo-next.git
echo git push -u origin main
echo.
echo O crear una nueva rama en el repositorio existente:
echo.
echo git remote add origin https://github.com/tu-usuario/olimpo-web.git
echo git checkout -b nextjs-version
echo git push -u origin nextjs-version
echo =============================================
pause
