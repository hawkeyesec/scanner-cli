FROM centos:7
MAINTAINER Karl Stoney <me@karlstoney.com>

RUN yum -y -q update && \
    yum -y -q remove iputils && \
    yum -y -q install http://rpms.remirepo.net/enterprise/remi-release-7.rpm && \
    yum-config-manager -y -q --enable remi-php72 && \
    yum -y -q install wget epel-release openssl openssl-devel tar unzip \
			  libffi-devel python-devel redhat-rpm-config git-core \
			  gcc gcc-c++ make zlib-devel pcre-devel ca-certificates \
              ruby rubygems java-1.8.0-openjdk.x86_64 which \
              php php-cli && \
    yum -y -q clean all

# Get nodejs repos
ENV NODE_VERSION=10.10.0
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN yum -y install nodejs-${NODE_VERSION} && \
    yum -y clean all

RUN node --version && \
    npm --version

# If we have changed the hawkeye version, do an update
RUN yum -y -q update && \
    yum -y -q clean all

# Install python-pip
RUN curl "https://bootstrap.pypa.io/get-pip.py" -o "get-pip.py"
RUN python get-pip.py

# Add bundler-audit
RUN gem install bundler-audit brakeman
RUN bundle-audit update

# Add safety, piprot, bandit
RUN pip install safety==1.8.4 piprot==0.9.10 bandit==1.5.1

# Add FindSecBugs
ENV FINDSECBUGS_VERSION=1.8.0
RUN mkdir /usr/local/bin/findsecbugs && \
    cd /usr/local/bin/findsecbugs && \
    wget --quiet https://github.com/find-sec-bugs/find-sec-bugs/releases/download/version-${FINDSECBUGS_VERSION}/findsecbugs-cli-${FINDSECBUGS_VERSION}.zip && \
    unzip -q findsecbugs-cli-${FINDSECBUGS_VERSION}.zip && \
    chmod +x /usr/local/bin/findsecbugs/findsecbugs.sh && \
    rm findsecbugs-cli-${FINDSECBUGS_VERSION}.zip && \
    mv findsecbugs.sh findsecbugs

ENV PATH=/usr/local/bin/findsecbugs:$PATH

#Add Owasp Dependency Check
ENV OWASP_VERSION=3.3.2
ARG OWASP_DEP_FOLDER=/usr/local/bin/owaspdependency
RUN mkdir $OWASP_DEP_FOLDER && cd $OWASP_DEP_FOLDER && \
    wget --quiet http://dl.bintray.com/jeremy-long/owasp/dependency-check-${OWASP_VERSION}-release.zip && \
    unzip -q dependency-check-${OWASP_VERSION}-release.zip && \
    chmod +x $OWASP_DEP_FOLDER/dependency-check/bin/dependency-check.sh && \
    rm dependency-check-${OWASP_VERSION}-release.zip && \
    mv dependency-check/bin/dependency-check.sh dependency-check/bin/dependency-check

ENV PATH=$OWASP_DEP_FOLDER/dependency-check/bin:$PATH

#Add PHP security-checker
RUN cd /usr/local/bin && \
    wget --quiet https://get.sensiolabs.org/security-checker.phar && \
    chmod +x security-checker.phar

# Install hawkeye
RUN mkdir -p /hawkeye
COPY package.json /hawkeye

RUN cd /hawkeye && \
    npm install --production --quiet
COPY ./ /hawkeye

WORKDIR /target

ENV PATH=/hawkeye/bin:$PATH
ENTRYPOINT ["hawkeye"]
CMD ["scan", "/target"]
