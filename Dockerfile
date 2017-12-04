FROM centos:7
MAINTAINER Karl Stoney <me@karlstoney.com>

RUN yum -y -q update && \
    yum -y -q remove iputils && \
    yum -y -q install wget epel-release openssl openssl-devel tar unzip \
							libffi-devel python-devel redhat-rpm-config git-core \
							gcc gcc-c++ make zlib-devel pcre-devel ca-certificates \
              ruby rubygems java-1.8.0-openjdk.x86_64 which && \
    yum -y -q clean all

# Git-crypt
RUN cd /tmp && \
    wget --quiet https://www.agwa.name/projects/git-crypt/downloads/git-crypt-0.5.0.tar.gz && \
    tar xzf git-crypt* && \
    cd git-crypt* && \
    make && \
    make install && \
    rm -rf /tmp/git-crypt*

ENV NODE_VERSION=8.9.1
ENV NPM_VERSION=5.5.1

# Get nodejs repos
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -

RUN yum -y install nodejs-$NODE_VERSION && \
    yum -y clean all

RUN rm -rf /usr/lib/node_modules/npm && \
    mkdir /usr/lib/node_modules/npm && \
    curl -sL https://github.com/npm/npm/archive/v$NPM_VERSION.tar.gz | tar xz -C /usr/lib/node_modules/npm --strip-components=1

RUN node --version && \
    npm --version

# If we ever change the hawkeye version, redo everything below
ARG HE_VERSION=

# If we have changed the hawkeye version, do an update
RUN yum -y -q update && \
    yum -y -q clean all

# Install python-pip
RUN curl "https://bootstrap.pypa.io/get-pip.py" -o "get-pip.py"
RUN python get-pip.py

# Add bundler-audit
RUN gem install bundler-audit brakeman
RUN bundle-audit update

# Add safety
RUN pip install safety==1.6.1 piprot==0.9.7 bandit==1.4.0

# Add FindSecBugs
RUN  mkdir /usr/bin/findsecbugs && \
    cd /usr/bin/findsecbugs && \
    wget --quiet https://github.com/find-sec-bugs/find-sec-bugs/releases/download/version-1.4.6/findsecbugs-cli-1.4.6.zip && \
    unzip -q findsecbugs-cli-1.4.6.zip && \
    chmod +x /usr/bin/findsecbugs/findsecbugs.sh && \
    rm findsecbugs-cli-1.4.6.zip


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
