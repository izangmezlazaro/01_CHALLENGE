# SoundWave - Web de Música en AWS S3

Proyecto de infraestructura como código (IaC) y despliegue de una aplicación web estática de streaming de música (estilo Spotify) alojada en un bucket de **Amazon S3** con acceso público configurado.

---

## 🎯 Objetivo del Proyecto

Aprovisionar la infraestructura en la nube mediante **Terraform**, aplicar las políticas de acceso y configuración de website estático con **AWS CLI**, y desplegar la aplicación web interactiva **SoundWave** (HTML5, CSS3 moderno con modo oscuro y JavaScript con Web Audio API).

---

## 📁 Estructura de Archivos Principales

```text
proyectoweb/
├── main.tf               # Definición de infraestructura en Terraform
├── policy.json           # Política de lectura pública para S3 (GetObject)
├── EVIDENCIAS.md         # Registro de comandos y salidas de consola
├── web.txt               # Enlace al sitio web estático (1 sola línea)
├── index.html            # Interfaz principal de la aplicación
├── css/
│   └── styles.css        # Sistema de diseño, layout y estilos dark mode
├── js/
│   └── app.js            # Lógica del reproductor y sintetizador de audio
└── img/                  # Portadas de álbumes e imágenes de la web
```

---

## 🚀 Pasos de Despliegue

### 1. Inicialización y Validación de Infraestructura (Terraform)
```bash
cd proyectoweb
terraform init
terraform validate
terraform plan
terraform apply -auto-approve
```

### 2. Configuración del Acceso Público y Política (AWS CLI)
```bash
BUCKET="izan-challenge01-music20260924071151111900000001"

# Desactivar bloqueo de acceso público
aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Aplicar política de lectura pública
aws s3api put-bucket-policy --bucket "$BUCKET" --policy file://policy.json

# Habilitar modo website estático
aws s3 website s3://"$BUCKET"/ --index-document index.html --error-document index.html
```

### 3. Sincronización de Archivos Web
```bash
aws s3 sync . s3://"$BUCKET"/ --exclude "*.tf*" --exclude ".git*" --exclude "policy.*" --exclude ".terraform*"
```

---

## 🌐 URL Pública del Sitio Web

La URL final se encuentra disponible en el archivo [`web.txt`](web.txt):

👉 **[http://izan-challenge01-music20260924071151111900000001.s3-website-us-east-1.amazonaws.com/](http://izan-challenge01-music20260924071151111900000001.s3-website-us-east-1.amazonaws.com/)**

---

## 📋 Trazabilidad y Evidencias

El registro completo de comandos y salidas de consola se encuentra documentado en [`EVIDENCIAS.md`](EVIDENCIAS.md).

**Autor:** Izan Gómez
