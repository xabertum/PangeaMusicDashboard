# PangeaMusicDashboard

Dashboard interactivo (Angular 19, componentes standalone y signals) para explorar la
colección de música de Pangea a partir del fichero `MusicaPangea_Enriquecido.csv`
(copiado en `public/musica-pangea.csv` y parseado en el navegador con
[PapaParse](https://www.papaparse.com/)).

## Funcionalidades

- **KPIs**: total de álbumes, artistas, géneros/continentes, países y rango de años,
  recalculados según los filtros activos.
- **Filtros**: búsqueda de texto libre (artista/álbum/subgénero), selección múltiple de
  género/continente y país, y rango de años.
- **Gráficos** (Chart.js vía `ng2-charts`): álbumes por género/continente, top 15 países
  por número de álbumes y evolución de publicaciones por década.
- **Tabla** paginada y ordenable con el detalle de los álbumes filtrados.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.27.


## Docker

La aplicación incluye un `Dockerfile` multi-stage (build con Node 20 + servido con
Nginx) que genera una imagen ligera (~50 MB) con únicamente los artefactos estáticos
compilados.

Desde la raíz del repositorio (donde está `docker-compose.yml`):

```bash
docker compose up -d --build
```

La aplicación quedará disponible en `http://localhost:8080/`. Para detenerla:

```bash
docker compose down
```

También puede construirse/ejecutarse manualmente sin compose desde esta carpeta:

```bash
docker build -t pangea-music-dashboard .
docker run --rm -p 8080:80 pangea-music-dashboard
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
