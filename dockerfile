# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json para instalar as dependências
COPY package.json package-lock.json ./

# Instalar as dependências, mas apenas de produção
RUN npm ci --production --prefer-offline --no-audit

# Copiar o restante dos arquivos da aplicação após instalar as dependências
COPY . .

# Desabilitar o telemetry do Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Rodar o build da aplicação
RUN npm run build

# Etapa de execução
FROM node:20-alpine AS runner

WORKDIR /app

# Criando usuário seguro
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Copiar apenas os arquivos necessários da etapa de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json ./package.json

# Expor a porta que a aplicação vai rodar
EXPOSE 3000

# Definir o ambiente como produção
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]
