FROM centos:7
MAINTAINER Karl Stoney <me@karlstoney.com>

# Get nodejs repos
RUN curl --silent --location https://rpm.nodesource.com/setup_7.x | bash -

RUN yum -y -q update && \
    yum -y -q remove iputils && \
    yum -y -q install wget epel-release openssl openssl-devel tar unzip \
							libffi-devel python-devel redhat-rpm-config git-core \
							gcc gcc-c++ make zlib-devel pcre-devel ca-certificates \
              ruby rubygems java-1.8.0-openjdk-headless nodejs-7.9* && \
    yum -y -q clean all
ENV JAVA_HOME=/usr/lib/jvm/jre-1.8.0-openjdk

# Git-crypt
RUN cd /tmp && \
    wget --quiet https://www.agwa.name/projects/git-crypt/downloads/git-crypt-0.5.0.tar.gz && \
    tar xzf git-crypt* && \
    cd git-crypt* && \
    make && \
    make install && \
    rm -rf /tmp/git-crypt*

# Add bundler-audit
RUN gem install bundler-audit

# Ensure the latest bundle-audit database
RUN bundle-audit update

# Download owasp dependency checking
RUN cd /usr/local/src && \
    wget http://dl.bintray.com/jeremy-long/owasp/dependency-check-1.4.5-release.zip && \
    unzip dependency-check-* && \
    rm -f *.zip && \
    cd dependency-check*/bin && \
    ./dependency-check.sh --updateonly

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
