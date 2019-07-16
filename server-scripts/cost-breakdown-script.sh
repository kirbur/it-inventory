#!/bin/bash
# Script to hit the costBreakdown endpoint.

curl -k --request PATCH --header "token: $1" https://localhost:44358/api/job/costbreakdown
