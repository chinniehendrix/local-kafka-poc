FROM confluentinc/cp-kafka-connect:5.5.1
RUN addgroup --system --gid 10001 skynetgrp
RUN adduser skynet --system --disabled-password --uid 10000 --shell /sbin/nologin --home /opt/app/ --gid 10001

RUN mkdir /opt/app/jars && chown skynet:skynetgrp /opt/app/jars

ADD mirror-tool-3.1.0.jar /opt/app/mirror-tool-3.1.0.jar

RUN chmod 644 /opt/app/mirror-tool-3.1.0.jar

USER 10000

EXPOSE 5556