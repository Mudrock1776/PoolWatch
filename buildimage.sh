VERSION=$(cat version)
podman build -t repo.skadi/poolwatch:$VERSION .
podman push repo.skadi/poolwatch:$VERSION