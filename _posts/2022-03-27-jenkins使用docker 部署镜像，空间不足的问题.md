---

layout: post
title: docker 问题排查
date: 2022-03-27
toc: true
excerpt:  docker 遇到的问题
tags: [java,棘手问题]
comments: true
author: zempty

---


	[29330] Failed to execute script docker-compose
	Traceback (most recent call last):
	  File "site-packages/docker/utils/build.py", line 97, in create_archive
	  File "tarfile.py", line 1980, in addfile
	  File "tarfile.py", line 252, in copyfileobj
	  File "tempfile.py", line 485, in func_wrapper
	OSError: [Errno 28] No space left on device
	
	During handling of the above exception, another exception occurred:
	
	Traceback (most recent call last):
	  File "bin/docker-compose", line 6, in <module>
	  File "compose/cli/main.py", line 71, in main
	  File "compose/cli/main.py", line 127, in perform_command
	  File "compose/cli/main.py", line 287, in build
	  File "compose/project.py", line 384, in build
	  File "compose/project.py", line 366, in build_service
	  File "compose/service.py", line 1080, in build
	  File "site-packages/docker/api/build.py", line 154, in build
	  File "site-packages/docker/utils/build.py", line 31, in tar
	  File "site-packages/docker/utils/build.py", line 100, in create_archive
	OSError: Can not read file in context: /var/lib/jenkins/workspace/cloud_dp_office/favourite/build/libs/favourite-0.0.1-SNAPSHOT.jar
	[Pipeline] }
	[Pipeline] // stage
	[Pipeline] stage
	[Pipeline] { (Push Image)
	Stage "Push Image" skipped due to earlier failure(s)
	[Pipeline] }
	[Pipeline] // stage
	[Pipeline] stage
	[Pipeline] { (deploy)
	Stage "deploy" skipped due to earlier failure(s)
	[Pipeline] }
	[Pipeline] // stage
	[Pipeline] }
	[Pipeline] // node
	[Pipeline] End of Pipeline
	ERROR: script returned exit code 255
	Finished: FAILURE

解决方法：
```
docker system prune --volumes
```