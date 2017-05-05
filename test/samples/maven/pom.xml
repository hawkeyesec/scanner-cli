<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.github.kevinsawicki</groupId>
	<artifactId>github-maven-example</artifactId>
	<version>0.1-SNAPSHOT</version>
	<name>GitHub Maven Plugin Example</name>
	<description>Project to demonstrate GitHub Maven plugins</description>
	<url>https://github.com/kevinsawicki/github-maven-example</url>

	<issueManagement>
		<url>https://github.com/kevinsawicki/github-maven-example/issues</url>
		<system>GitHub Issues</system>
	</issueManagement>

	<licenses>
		<license>
			<name>MIT License</name>
			<url>http://www.opensource.org/licenses/mit-license.php</url>
			<distribution>repo</distribution>
		</license>
	</licenses>

	<scm>
		<url>https://github.com/kevinsawicki/github-maven-example</url>
		<connection>scm:git:git://github.com/kevinsawicki/github-maven-example.git</connection>
		<developerConnection>scm:git:git@github.com:kevinsawicki/github-maven-example.git</developerConnection>
	</scm>

	<developers>
		<developer>
			<email>kevinsawicki@gmail.com</email>
			<name>Kevin Sawicki</name>
			<url>https://github.com/kevinsawicki</url>
			<id>kevinsawicki</id>
		</developer>
	</developers>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	</properties>

	<build>
		<plugins>
			<plugin>
				<groupId>com.github.github</groupId>
				<artifactId>downloads-maven-plugin</artifactId>
				<version>0.6</version>
				<configuration>
					<description>Official ${project.name} build of the ${project.version} release</description>
					<override>true</override>
					<includeAttached>true</includeAttached>
					<server>github</server>
				</configuration>
				<executions>
					<execution>
						<goals>
							<goal>upload</goal>
						</goals>
						<phase>install</phase>
					</execution>
				</executions>
			</plugin>
			<plugin>
				<groupId>com.github.github</groupId>
				<artifactId>site-maven-plugin</artifactId>
				<version>0.7</version>
				<configuration>
					<message>Building site for ${project.version}</message>
					<server>github</server>
				</configuration>
				<executions>
					<execution>
						<goals>
							<goal>site</goal>
						</goals>
						<phase>site</phase>
					</execution>
				</executions>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-site-plugin</artifactId>
				<version>3.0</version>
				<configuration>
					<reportPlugins>
						<plugin>
							<groupId>org.apache.maven.plugins</groupId>
							<artifactId>maven-project-info-reports-plugin</artifactId>
							<version>2.2</version>
							<configuration>
								<dependencyDetailsEnabled>true</dependencyDetailsEnabled>
								<dependencyLocationsEnabled>true</dependencyLocationsEnabled>
							</configuration>
						</plugin>
						<plugin>
							<groupId>org.apache.maven.plugins</groupId>
							<artifactId>maven-javadoc-plugin</artifactId>
							<version>2.7</version>
						</plugin>
						<plugin>
							<groupId>org.apache.maven.plugins</groupId>
							<artifactId>maven-surefire-report-plugin</artifactId>
							<version>2.6</version>
						</plugin>
						<plugin>
							<groupId>org.apache.maven.plugins</groupId>
							<artifactId>maven-checkstyle-plugin</artifactId>
							<version>2.6</version>
						</plugin>
					</reportPlugins>
				</configuration>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<configuration>
					<source>1.6</source>
					<target>1.6</target>
				</configuration>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-jar-plugin</artifactId>
				<configuration>
					<archive>
						<manifest>
							<addDefaultImplementationEntries>true</addDefaultImplementationEntries>
							<addDefaultSpecificationEntries>true</addDefaultSpecificationEntries>
						</manifest>
					</archive>
				</configuration>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-javadoc-plugin</artifactId>
				<executions>
					<execution>
						<goals>
							<goal>jar</goal>
						</goals>
					</execution>
				</executions>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-source-plugin</artifactId>
				<executions>
					<execution>
						<goals>
							<goal>jar</goal>
						</goals>
					</execution>
				</executions>
			</plugin>
		</plugins>
	</build>

	<dependencies>
		<dependency>
			<groupId>junit</groupId>
			<artifactId>junit</artifactId>
			<version>4.8</version>
			<scope>test</scope>
		</dependency>
	</dependencies>
</project>
