#!/bin/bash
# Script to hit the lowResource endpoint.

curl -k --request PATCH --header "token: $1" https://itinventory.cqlcorp.net/api/job/lowresource
