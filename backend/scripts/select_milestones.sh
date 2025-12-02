#!/bin/bash

# Select all milestones from the database
sqlite3 database.sqlite "SELECT * FROM milestones;"
