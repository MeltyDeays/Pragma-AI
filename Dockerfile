FROM node:20-slim

# Instalar git necesario para clonar repositorios de estudiantes
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Crear usuario sin privilegios de root (requerido por Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copiar archivos de dependencias
COPY --chown=user package*.json ./

# Instalar dependencias para producción
RUN npm ci --only=production

# Copiar los archivos del proyecto al contenedor
COPY --chown=user . .

# Exponer el puerto 7860 (Hugging Face redirecciona el tráfico aquí)
EXPOSE 7860
ENV PORT=7860

# Arrancar el servidor backend usando el script principal
CMD ["node", "server.cjs"]
