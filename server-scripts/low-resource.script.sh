#!/bin/bash
# Script to hit the lowResource endpoint.

curl -k --request PATCH --header "token: $1" https://localhost:44358/api/job/lowresource
