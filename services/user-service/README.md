# user-service


A simple HRMS user service with Express + TypeScript.


## Local dev
```bash
cd services/user-service
npm ci
npm run dev
```
The service listens on `:3000` and exposes `/healthz`, `/readyz`, `/metrics`, `/api/v1/users`.


## Build container
```bash
docker build -t <acr>.azurecr.io/user-service:dev services/user-service
```


## Helm install (AKS)
> Ensure your AKS has pull access to ACR and you have a Postgres connection string stored in Key Vault or a Kubernetes Secret.


```bash
NAMESPACE=hrms
helm upgrade --install user-svc services/user-service/helm \
-n $NAMESPACE --create-namespace \
--set image.repository=<acr>.azurecr.io/user-service \
--set image.tag=$GIT_SHA \
--set env.PORT=3000 \
--set env.DATABASE_URL="" # or via Key Vault CSI below
```


### Using Key Vault CSI
```bash
helm upgrade --install user-svc services/user-service/helm \
-n $NAMESPACE --create-namespace \
--set image.repository=<acr>.azurecr.io/user-service \
--set keyVaultCSI.enabled=true \
--set keyVaultCSI.tenantId=<tenant-id> \
--set keyVaultCSI.keyVaultName=<kv-name> \
--set keyVaultCSI.secrets[0].objectName=db-connection \
--set keyVaultCSI.secrets[0].objectType=secret \
--set keyVaultCSI.secrets[0].key=DATABASE_URL
```