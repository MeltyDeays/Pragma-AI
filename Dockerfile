FROM node:20-slim

# Instalar git necesario para clonar repositorios de estudiantes
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Usar el usuario 'node' (que ya tiene UID 1000) provisto por la imagen oficial
USER node
ENV HOME=/home/node \
    PATH=/home/node/.local/bin:$PATH

WORKDIR $HOME/app

# Copiar archivos de dependencias
COPY --chown=node package*.json ./

# Instalar dependencias para producción
RUN npm install --omit=dev

# Copiar los archivos del proyecto al contenedor
COPY --chown=node . .

# Exponer el puerto 7860 (Hugging Face redirecciona el tráfico aquí)
EXPOSE 7860
ENV PORT=7860

# Arrancar el servidor backend usando el script principal
CMD ["node", "server.cjs"]
