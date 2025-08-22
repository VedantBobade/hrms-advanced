{{- define "auth-service.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- define "auth-service.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "auth-service.name" .) | trunc 63 -}}
{{- end -}}