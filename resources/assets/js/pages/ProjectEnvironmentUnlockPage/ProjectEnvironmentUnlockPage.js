import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import ProjectService from '../../services/Project';
import ProjectEnvironmentUnlockService from '../../services/ProjectEnvironmentUnlock';
import ProjectEnvironmentService from '../../services/ProjectEnvironment';

import Alert from '../../components/Alert';
import AlertErrorValidation from '../../components/AlertErrorValidation'; 
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import TextField from '../../components/TextField';
import Panel from '../../components/Panel';
import PanelHeading from '../../components/PanelHeading';
import PanelBody from '../../components/PanelBody';

class ProjectEnvironmentUnlockPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFetching: true,
      project: {},
      servers: [],
      syncStatus: '',
      environment: {
        key: ''
      },
      unlocked: false,
      errors: []
    };
    
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleUpdateClick = this.handleUpdateClick.bind(this);
    this.handleCancelClick = this.handleCancelClick.bind(this);
  }

  componentWillMount() {
    const projectService = new ProjectService;

    projectService
      .get(this.props.match.params.project_id)
      .then(response => {
        this.setState({
          isFetching: false,
          project: response.data,
          servers: response.data.servers
        });
      });
  }
  
  componentDidMount() {
    const { project } = this.props;

    Echo.private('project.' + project.id)
      .listen('.Deploy\\Events\\EnvironmentSyncing', (e) => {
        let environment = e.environment.id;
        this.setState({syncStatus: 'Syncing'});
      })
      .listen('.Deploy\\Events\\EnvironmentSynced', (e) => {
        let environment = e.environment.id;
        this.setState({syncStatus: 'Synced'});

        setTimeout(() => {
          this.setState({syncStatus: ''});
        }, 300);
      });
  }

  /**
   * Handle input change.
   *
   * @param {object} event
   */
  handleInputChange(event) {
    const value = event.target.value;
    const name = event.target.name;

    this.setState(state => {
      let environment = Object.assign({}, state.environment, {
        [name]: value
      });
      return {environment: environment}
    });
  }

  /**
   * Handle environment unlock click.
   */
  handleClick() {
    const { project, environment } = this.state;
    const projectEnvironmentUnlockService = new ProjectEnvironmentUnlockService;
    
    projectEnvironmentUnlockService
      .post(project.id, environment)
      .then(response => {
      	this.setState({errors: []});

        this.setState(state => {
          let environment = Object.assign({}, state.environment, response.data);

          return {
            environment: environment,
            unlocked: true
          }
        });
      },
      error => {
        this.setState({
          errors: buildAlertFromResponse(error.response)
        });
      });
  }
  
  /**
   * Handle environment update click.
   */
  handleUpdateClick() {
    const { project, environment } = this.state;
    const projectEnvironmentService = new ProjectEnvironmentService;

    projectEnvironmentService
      .put(project.id, environment)
      .then(response => {
      	  this.setState({
      	    errors: []
      	  });
      }, 
      error => {
        this.setState({
          errors: buildAlertFromResponse(error.response)
        });
      });
  }
  
  /**
   * Handle cancel environement update click.
   */
  handleCancelClick() {
    this.setState(state => {
      let environment = Object.assign({}, state.environment, {
        key: null,
        contents: null
      });

      return {
        environment: environment,
        unlocked: false
      }
    });
  }

  /**
   * Render breadcrumbs.
   *
   * @param {object} project
   * @return {XML}
   */
  renderBreadcrumbs(project) {
    return (
      <div className="breadcrumbs">
        <div className="container">
          <div className="pull-left">
            <span className="heading">
              <Link to={'/projects/' + project.id}>{project.name}</Link>{' '}
              <Icon iconName="angle-double-right" />{' '}
              Environment
            </span>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {
      environment,
      unlocked,
      errors,
      servers,
      syncStatus
    } = this.state;
    
    const {
      project
    } = this.props;
    
    if (unlocked) {
      return (
        <div>
          {this.renderBreadcrumbs(project)}

          <div className="container content">
            <Alert type="warning">
              Your environment information will be stored in an .env file on your servers.
            </Alert>

            <div className="row">
              <div className="col-xs-12 col-md-8">
                <Panel>
                  <PanelBody>
                    {errors.length ? <AlertErrorValidation errors={errors} /> : ''}

                    <div class="form-group">
                      <TextField
                        label="Key"
                        name="key"
                        type="password"
                        onChange={this.handleInputChange}
                        value={environment.key}
                      />
                    </div>

                    <div class="form-group">
                      <label>Contents</label>
                      <textarea
                        className="form-control"
                        name="contents"
                        onChange={this.handleInputChange}
                        rows="6"
                        style={{fontFamily: 'monospace', resize: 'vertical'}}
                      >{environment.contents}</textarea>
                    </div>

                    <Button
                      onClick={this.handleCancelClick}
                      style={{marginRight: 5}}
                    >Cancel</Button>

                    <Button
                      onClick={this.handleUpdateClick}
                    >Update Environment</Button>
                  </PanelBody>
                </Panel>
              </div>

              <div className="col-xs-12 col-md-4">
                <Panel>
                  <PanelHeading>
                    <div className="pull-right">
                      {syncStatus}
                    </div>
                    Servers
                  </PanelHeading>
                  <table className="table">
                    <thead>
                      <tr>
                        <th width="60%">Server</th>
                        <th width="60%">Updated At</th>
                      </tr>
                    </thead>
                    <tbody>
                    {servers.map(server =>
                      <tr>
                        <td>{server.name}</td>
                        <td>--</td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </Panel>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div>
        {this.renderBreadcrumbs(project)}

        <div className="container content">
          <Alert type="warning">
            Your environment information will be encrypted on our server using your
            chosen key. You will also have to provide your key each time you wish to
            update your information.
            <br/><br/>
            Please keep in mind that we do not store your key and have no way of
            retrieving it. Therefore if you forget your key, you will need to reset your key which will also
            result in any previous encrypted environment information being cleared
            from our server.
          </Alert>
          
          <Panel>
            <PanelBody>
            	{errors.length ? <AlertErrorValidation errors={errors} /> : ''}

            	<div class="form-group">
                <TextField
                  label="Key"
                  name="key"
                  type="password"
                  onChange={this.handleInputChange}
                  value={environment.key}
                />
              </div>

              <div className="form-group">
                <Button 
                  onClick={this.handleClick}
                >Unlock Environment</Button>
              </div>

              <Link 
                to={'/projects/' + project.id + '/environment-reset'}
              >Need to reset your key?</Link>
            </PanelBody>
          </Panel>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return state.project;
};

export default connect(
  mapStateToProps
)(ProjectEnvironmentUnlockPage)