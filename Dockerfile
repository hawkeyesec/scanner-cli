FROM centos:7
LABEL maintainer="felix.hammerl@gmail.com"

RUN yum -y -q update
RUN yum -y -q remove iputils
RUN yum -y -q install ca-certificates
RUN yum -y -q install http://rpms.remirepo.net/enterprise/remi-release-7.rpm
RUN yum-config-manager -y -q --enable remi-php72
RUN yum -y -q install wget epel-release openssl openssl-devel tar unzip \
			  libffi-devel python-devel redhat-rpm-config git-core \
			  gcc gcc-c++ make zlib-devel pcre-devel \
        java-1.8.0-openjdk.x86_64 which \
        php php-cli

ENV PATH /usr/local/rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH

ENV NODE_VERSION=10.16.0
RUN curl --silent --location https://rpm.nodesource.com/setup_10.x | bash -
RUN yum -y install nodejs-${NODE_VERSION}

RUN node --version && \
    npm --version

RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN yum -y -q update
RUN yum -y -q install yarn

RUN yum -y -q clean all

RUN curl "https://bootstrap.pypa.io/get-pip.py" -o "get-pip.py"
RUN python get-pip.py
RUN pip install safety==1.8.4 piprot==0.9.10 bandit==1.5.1

ENV RUBY_VERSION=2.6.3
RUN curl -sSL https://rvm.io/mpapis.asc | gpg --import - && \
    curl -sSL https://rvm.io/pkuczynski.asc | gpg2 --import - && \
    curl -sSL https://raw.githubusercontent.com/rvm/rvm/stable/binscripts/rvm-installer     -o rvm-installer && \
    curl -sSL https://raw.githubusercontent.com/rvm/rvm/stable/binscripts/rvm-installer.asc -o rvm-installer.asc && \
    gpg2 --verify rvm-installer.asc rvm-installer && \
    bash rvm-installer
RUN echo 'source /etc/profile.d/rvm.sh' >> /etc/profile && \
    /bin/bash -l -c "rvm requirements;" && \
    rvm install ${RUBY_VERSION}
RUN /bin/bash -l -c "rvm use --default ${RUBY_VERSION}"
ENV PATH "/usr/local/rvm/gems/ruby-${RUBY_VERSION}/bin/:$PATH"
RUN /bin/bash -l -c "gem install bundler:2.0.1 bundler-audit:0.6.1 brakeman:4.5.1"
RUN /bin/bash -l -c "bundle audit update"

ENV FINDSECBUGS_VERSION=1.8.0
ARG FINDSECBUGS_FOLDER=/usr/local/opt/findsecbugs
RUN mkdir -p ${FINDSECBUGS_FOLDER} && cd ${FINDSECBUGS_FOLDER} && \
    wget --quiet https://github.com/find-sec-bugs/find-sec-bugs/releases/download/version-${FINDSECBUGS_VERSION}/findsecbugs-cli-${FINDSECBUGS_VERSION}.zip && \
    unzip -q findsecbugs-cli-${FINDSECBUGS_VERSION}.zip && \
    rm findsecbugs.sh
COPY scripts/findsecbugs.sh ${FINDSECBUGS_FOLDER}/findsecbugs.sh
RUN chmod +x ${FINDSECBUGS_FOLDER}/findsecbugs.sh && \
    ln -s ${FINDSECBUGS_FOLDER}/findsecbugs.sh /usr/local/bin/findsecbugs

ENV OWASP_VERSION=5.0.0
ARG OWASP_DEP_FOLDER=/usr/local/bin/owaspdependency
RUN mkdir $OWASP_DEP_FOLDER && cd $OWASP_DEP_FOLDER && \
    wget --quiet http://dl.bintray.com/jeremy-long/owasp/dependency-check-${OWASP_VERSION}-release.zip && \
    unzip -q dependency-check-${OWASP_VERSION}-release.zip && \
    chmod +x $OWASP_DEP_FOLDER/dependency-check/bin/dependency-check.sh && \
    rm dependency-check-${OWASP_VERSION}-release.zip && \
    mv dependency-check/bin/dependency-check.sh dependency-check/bin/dependency-check
ENV PATH=$OWASP_DEP_FOLDER/dependency-check/bin:$PATH
RUN dependency-check --updateonly

RUN cd /usr/local/bin && \
    wget --quiet https://get.sensiolabs.org/security-checker.phar && \
    chmod +x security-checker.phar

RUN mkdir -p /hawkeye
COPY ./ /hawkeye
RUN cd /hawkeye && \
    npm install --production --quiet

WORKDIR /target

ENV PATH=/hawkeye/bin:$PATH
ENTRYPOINT ["hawkeye", "scan"]
