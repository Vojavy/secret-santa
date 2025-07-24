| Шаг                | Локально                                      | В CI / k3s                                         |
| ------------------ | --------------------------------------------- | -------------------------------------------------- |
| **Сборка образов** | `docker compose build`                        | `docker build -t registry/santa-*`                 |
| **Запуск**         | `docker compose --env-file deploy/dev.env up` | `kubectl apply -k deploy/k8s` (или Helm/Kustomize) |
| **ENV‑ы**          | `env_file`                                    | `ConfigMap` + `Secret`                             |
| **Балансировка**   | nginx‑proxy (контейнер)                       | Ingress‑Controller                                 |
