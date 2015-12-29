var Client = require('../src/api/client')
var expect = require('chai').expect

describe('Jira api client', function () {
  describe('With valid config information', function () {
    var JiraClient, configData

    before(function () {
      configData = {
        username: 'test',
        password: 'test',
        host: 'test.domain.com',
        protocol: 'https',
        port: '',
        apiVersion: '2'
      };

      JiraClient = new Client(configData)
    })

    it('It should not throw exception for valid config object', function () {
      expect(() => { return JiraClient }).to.not.throw(Error)
    })

    it('It should set default properties for api requests', function () {
      expect(JiraClient.username).to.be.equal(configData.username)
      expect(JiraClient.password).to.be.equal(configData.password)
      expect(JiraClient.protocol).to.be.equal(configData.protocol)
      expect(JiraClient.host).to.be.equal(configData.host)
      expect(JiraClient.port).to.be.equal(configData.port)
      expect(JiraClient.apiVersion).to.be.equal(configData.apiVersion)
    })
  })

  describe('With invalid config information', function () {
    it('It should throw exception when config object does not have all request fields', function () {      
      var configData = {
        username: 'test',
        password: 'test'
      }
      expect((configData) => { new Client(configData) }).to.throw(Error)
    })
  })
})