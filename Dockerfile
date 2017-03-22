FROM centos:7
MAINTAINER Karl Stoney <me@karlstoney.com>

RUN yum -y -q update && \
    yum -y -q remove iputils && \
    yum -y -q install wget epel-release openssl openssl-devel tar unzip \
							libffi-devel python-devel redhat-rpm-config git-core \
							gcc gcc-c++ make zlib-devel pcre-devel ca-certificates && \
    yum -y -q clean all

# Get nodejs repos
RUN curl --silent --location https://rpm.nodesource.com/setup_7.x | bash -
RUN yum -y -q install nodejs

RUN mkdir -p /hawkeye
COPY package.json /hawkeye
RUN cd /hawkeye && \
    npm install --production --quiet
COPY ./ /hawkeye

WORKDIR /target

# Git-crypt
RUN cd /tmp && \
    wget --quiet https://www.agwa.name/projects/git-crypt/downloads/git-crypt-0.5.0.tar.gz && \
    tar xzf git-crypt* && \
    cd git-crypt* && \
    make && \
    make install && \
    rm -rf /tmp/git-crypt*

ENV PATH=/hawkeye/bin:$PATH
ENTRYPOINT ["hawkeye"]
CMD ["scan", "/target"]
