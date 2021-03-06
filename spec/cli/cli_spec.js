var Client = require('../../src/api/client')
var Api = require('../../src/api/api')
var Cli = require('../../src/cli/cli')

var TableRenderer = require('../../src/util/table_renderer')
var Logger = require('../../src/util/logger')

var expect = require('chai').expect
var assert = require('chai').assert
var sinon = require('sinon')

describe('Jira Cli', function () {

  var ConfigData, JiraClient, JiraApi, JiraCli

  before(function () {
    ConfigData = {
      username: 'test',
      password: 'test',
      host: 'test.domain.com',
      protocol: 'https',
      port: '',
      apiVersion: '2'
    };

    JiraClient = Client.createClientWith(ConfigData)
    JiraApi = Api.createApiWith(JiraClient)

    JiraCli = Cli.createCliWith(JiraApi, TableRenderer, Logger)
  })

  describe('Issue', function () {  
    it('It should render jira issue detail', function() {
      JiraApi.getIssue = sinon.stub().returns(Promise.resolve({
        key: 'some key',
        type: 'issue type',
        summary: 'summary',        
        status: 'status name',
        projectKey: 'project key',
        projectName: 'project name'
      }));

      JiraCli.tableRenderer.renderTitle = sinon.spy();
      JiraCli.tableRenderer.renderVertical = sinon.spy();

      return JiraCli.renderIssue({key: 'AAABB'})
        .then(() => {
          assert(JiraCli.tableRenderer.renderTitle.calledWith('Issue detail summary'))
          assert(JiraCli.tableRenderer.renderVertical.calledWith([
            {'Key': 'some key'},
            {'Issue Type': 'issue type'},
            {'Summary': 'summary'},
            {'Status': 'status name'},
            {'Project': 'project name (project key)'}
          ]))
        })
    })
  })

  describe('User issues', function () {
    it('It should render all issues for current user', function () {
      JiraApi.getIssues = sinon.stub().returns(Promise.resolve([
        {
          key: 'KEY_1',
          status: 'In Progress',
          summary: 'Test issue 1'
        },
        {
          key: 'KEY_2',
          status: 'Open',
          summary: 'Test issue 2'
        }
      ]))

      JiraCli.tableRenderer.render = sinon.spy()

      return JiraCli.renderIssues()
        .then(() => {
          assert(JiraCli.tableRenderer.render.calledWith(
            ['Issue key', 'Status', 'Summary'],
            [ 
              [ 'KEY_1', 'In Progress', 'Test issue 1' ],
              [ 'KEY_2', 'Open', 'Test issue 2' ]
            ]
          ))
        })
    })

    it('It should render warning message when no issue found for current user', function () {
      JiraApi.getIssues = sinon.stub().returns(Promise.reject('There are no issues for current user'))

      JiraCli.logger.error = sinon.spy()
      return JiraCli.renderIssues({options: 'PROJECT_KEY_1'})
        .catch(() => {
          assert(JiraCli.logger.error.calledWith('There are no issues for current user'))
        })
    })
  })

  describe('Issue worklogs', function () {
    it('It should render worklogs for an issue', function () {
      JiraApi.getIssueWorklogs = sinon.stub().returns(Promise.resolve([{
        id: '12345',
        timeSpent: '1h 30m',
        comment: 'worklog comment',
        author: 'logger name',
        created: '2015-12-12'
      }]))

      JiraCli.tableRenderer.render = sinon.spy()
      return JiraCli.renderIssueWorklogs('AAABB')
        .then(() => {
          assert(JiraCli.tableRenderer.render.calledWith(
            ['Worklog Id', 'Timespent', 'Comment', 'Author', 'Created'],
            [['12345', '1h 30m', 'worklog comment', 'logger name', '2015-12-12']]
          ))
        })
    })

    it('It should render warning when worklogs not found for an issue', function () {
      JiraApi.getIssueWorklogs = sinon.stub().returns(Promise.reject('There are no worklogs for this issue'))

      JiraCli.logger.error = sinon.spy()
      return JiraCli.renderIssueWorklogs('AAABB')
        .catch((error) => {
          assert(JiraCli.logger.error.calledWith('There are no worklogs for this issue'))
        })
    })

    it('It should render 404 with text message for invalid issue', function () {
      JiraApi.getIssueWorklogs = sinon.stub().returns(Promise.reject(
        new Error('404 - Issue Does Not Exist')
      ));

      JiraCli.logger.error = sinon.spy();
      return JiraCli.renderIssueWorklogs('AAABB')
        .catch(() => {
          assert(JiraCli.logger.error.calledWith('404 - Issue Does Not Exist'))
        })
    })
  })
})
