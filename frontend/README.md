# S3HelixFrontend

## Production environment

The website is available through a CloudFront CDN (https://us-east-1.console.aws.amazon.com/cloudfront/v4/home?region=eu-west-1#/distributions/E2L147YFWJPY8) pointing to an S3 Bucket (https://eu-west-1.console.aws.amazon.com/s3/buckets/s3-helix-frontend?region=eu-west-1&tab=objects&bucketType=general).

Production website : [https://d3g61e6x4dzhq2.cloudfront.net/](https://d3g61e6x4dzhq2.cloudfront.net/)

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. 