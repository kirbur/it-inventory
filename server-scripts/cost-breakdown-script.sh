#!/bin/bash
# Script to hit the costBreakdown endpoint.

curl -k --request PATCH --header "token: $1" https://itinventory.cqlcorp.net/api/job/costbreakdown
