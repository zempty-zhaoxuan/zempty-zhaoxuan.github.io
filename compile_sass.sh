#!/bin/bash

# Compile SASS with the correct load path
sass --load-path=_sass style.scss style.css

echo "SASS compilation complete!" 