FROM ekidd/rust-musl-builder AS cargo-audit-build

RUN cargo install cargo cargo-audit --root /home/rust && \
    strip /home/rust/bin/cargo /home/rust/bin/cargo-audit

FROM alpine:3.10

ARG FINDSECBUGS_FOLDER=/usr/local/opt/findsecbugs
ARG OWASP_DEP_FOLDER=/usr/local/bin/owaspdependency

RUN apk add --no-cache \
            bash \
            git \
            nodejs \
            npm \
            openjdk8-jre \
            php-cli \
            php-json \
            php-mbstring \
            php-openssl \
            php-phar \
            python \
            py2-pip \
            ruby  

RUN { \
        echo 'install: --no-document'; \
        echo 'update: --no-document'; \
    } >> /etc/gemrc

RUN pip install --no-cache-dir safety==1.8.5 piprot==0.9.10 bandit==1.6.2

RUN gem install bundler bundler-audit:0.6.1 brakeman:4.5.1 && bundle audit update \
    && rm -rf $(gem env home)/cache/*

ENV FINDSECBUGS_VERSION=1.8.0
RUN mkdir -p ${FINDSECBUGS_FOLDER} && cd ${FINDSECBUGS_FOLDER} \
    && wget --quiet https://github.com/find-sec-bugs/find-sec-bugs/releases/download/version-${FINDSECBUGS_VERSION}/findsecbugs-cli-${FINDSECBUGS_VERSION}.zip \
    && unzip -q findsecbugs-cli-${FINDSECBUGS_VERSION}.zip \
    && rm findsecbugs-cli-${FINDSECBUGS_VERSION}.zip \
    && rm findsecbugs.sh

COPY scripts/findsecbugs.sh ${FINDSECBUGS_FOLDER}/findsecbugs.sh
RUN chmod +x ${FINDSECBUGS_FOLDER}/findsecbugs.sh \
    && ln -s ${FINDSECBUGS_FOLDER}/findsecbugs.sh /usr/local/bin/findsecbugs

ENV OWASP_VERSION=5.2.4
RUN mkdir $OWASP_DEP_FOLDER && cd $OWASP_DEP_FOLDER \
    && wget --quiet http://dl.bintray.com/jeremy-long/owasp/dependency-check-${OWASP_VERSION}-release.zip \
    && unzip -q dependency-check-${OWASP_VERSION}-release.zip \
    && chmod +x $OWASP_DEP_FOLDER/dependency-check/bin/dependency-check.sh \
    && rm dependency-check-${OWASP_VERSION}-release.zip \
    && mv dependency-check/bin/dependency-check.sh dependency-check/bin/dependency-check

RUN cd /usr/local/bin \
    && wget --quiet https://get.sensiolabs.org/security-checker.phar \
    && chmod +x security-checker.phar

COPY --from=cargo-audit-build /home/rust/bin/ /usr/local/bin/
RUN cargo-audit --help

RUN mkdir -p /hawkeye
COPY . /hawkeye
RUN cd /hawkeye && npm install --production --quiet \
    && rm -rf /var/cache/apk/*

WORKDIR /target

ENV PATH /hawkeye/bin:$OWASP_DEP_FOLDER/dependency-check/bin:$PATH
RUN dependency-check --updateonly
ENTRYPOINT ["hawkeye", "scan"]
