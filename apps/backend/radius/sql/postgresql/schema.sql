-- FreeRADIUS PostgreSQL schema for ConnectPoint
-- Run this once to create RADIUS tables alongside Prisma-managed tables

CREATE TABLE IF NOT EXISTS radcheck (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL DEFAULT '',
  attribute VARCHAR(255) NOT NULL DEFAULT '',
  op VARCHAR(2) NOT NULL DEFAULT '==',
  value VARCHAR(255) NOT NULL DEFAULT '',
  CONSTRAINT radcheck_username_key UNIQUE (username, attribute)
);

CREATE INDEX IF NOT EXISTS radcheck_username_idx ON radcheck (username);

CREATE TABLE IF NOT EXISTS radreply (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL DEFAULT '',
  attribute VARCHAR(255) NOT NULL DEFAULT '',
  op VARCHAR(2) NOT NULL DEFAULT '==',
  value VARCHAR(255) NOT NULL DEFAULT '',
  CONSTRAINT radreply_username_key UNIQUE (username, attribute)
);

CREATE INDEX IF NOT EXISTS radreply_username_idx ON radreply (username);

CREATE TABLE IF NOT EXISTS radgroupcheck (
  id SERIAL PRIMARY KEY,
  groupname VARCHAR(255) NOT NULL DEFAULT '',
  attribute VARCHAR(255) NOT NULL DEFAULT '',
  op VARCHAR(2) NOT NULL DEFAULT '==',
  value VARCHAR(255) NOT NULL DEFAULT '',
  CONSTRAINT radgroupcheck_groupname_key UNIQUE (groupname, attribute)
);

CREATE INDEX IF NOT EXISTS radgroupcheck_groupname_idx ON radgroupcheck (groupname);

CREATE TABLE IF NOT EXISTS radgroupreply (
  id SERIAL PRIMARY KEY,
  groupname VARCHAR(255) NOT NULL DEFAULT '',
  attribute VARCHAR(255) NOT NULL DEFAULT '',
  op VARCHAR(2) NOT NULL DEFAULT '==',
  value VARCHAR(255) NOT NULL DEFAULT '',
  CONSTRAINT radgroupreply_groupname_key UNIQUE (groupname, attribute)
);

CREATE INDEX IF NOT EXISTS radgroupreply_groupname_idx ON radgroupreply (groupname);

CREATE TABLE IF NOT EXISTS radusergroup (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL DEFAULT '',
  groupname VARCHAR(255) NOT NULL DEFAULT '',
  priority INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS radusergroup_username_idx ON radusergroup (username);

CREATE TABLE IF NOT EXISTS radacct (
  radacctid BIGSERIAL PRIMARY KEY,
  acctsessionid VARCHAR(255) NOT NULL DEFAULT '',
  acctuniqueid VARCHAR(255) NOT NULL DEFAULT '',
  username VARCHAR(253) NOT NULL DEFAULT '',
  groupname VARCHAR(253) NOT NULL DEFAULT '',
  realm VARCHAR(64) DEFAULT '',
  nasipaddress VARCHAR(45) NOT NULL DEFAULT '',
  nasportid VARCHAR(45) DEFAULT NULL,
  nasporttype VARCHAR(32) DEFAULT NULL,
  acctstarttime TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL,
  acctstoptime TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL,
  acctsessiontime BIGINT DEFAULT NULL,
  acctinputoctets BIGINT DEFAULT NULL,
  acctoutputoctets BIGINT DEFAULT NULL,
  acctterminatecause VARCHAR(32) DEFAULT NULL,
  acctstatustype VARCHAR(25) DEFAULT NULL,
  framedipaddress VARCHAR(45) NOT NULL DEFAULT '',
  calledstationid VARCHAR(50) NOT NULL DEFAULT '',
  callingstationid VARCHAR(50) NOT NULL DEFAULT '',
  acctstartdelay INTEGER DEFAULT NULL,
  acctstopdelay INTEGER DEFAULT NULL,
  xascendsessionsrvkey VARCHAR(10) DEFAULT NULL,
  connectinfo_start VARCHAR(128) DEFAULT NULL,
  connectinfo_stop VARCHAR(128) DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS radacct_username_idx ON radacct (username);
CREATE INDEX IF NOT EXISTS radacct_starttime_idx ON radacct (acctstarttime);
CREATE UNIQUE INDEX IF NOT EXISTS radacct_unique_idx ON radacct (acctuniqueid);

CREATE TABLE IF NOT EXISTS radpostauth (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL DEFAULT '',
  pass VARCHAR(128) DEFAULT NULL,
  reply VARCHAR(32) DEFAULT NULL,
  authdate TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS radpostauth_username_idx ON radpostauth (username);

CREATE TABLE IF NOT EXISTS nas (
  id SERIAL PRIMARY KEY,
  nasname VARCHAR(128) NOT NULL,
  shortname VARCHAR(32) DEFAULT NULL,
  type VARCHAR(30) DEFAULT 'other',
  ports INTEGER DEFAULT NULL,
  secret VARCHAR(60) DEFAULT NULL,
  server VARCHAR(64) DEFAULT NULL,
  community VARCHAR(50) DEFAULT NULL,
  description VARCHAR(200) DEFAULT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS nas_nasname_idx ON nas (nasname);
