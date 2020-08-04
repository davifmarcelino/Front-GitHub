/* eslint-disable react/button-has-type */
/* eslint-disable react/static-property-placement */
/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loading, Owner, IssueList } from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: propTypes.shape({
      params: propTypes.shape({
        repository: propTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    status: 'all',
    repoName: '',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'all',
          per_page: 30,
          page: 1,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      repoName,
    });
  }

  handleChangePage = async (e) => {
    const { status, page, repoName } = this.state;

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: status,
        per_page: 30,
        page: page + e,
      },
    });

    this.setState({ issues: issues.data, page: page + e });
  };

  handleTypeList = async (e) => {
    const { status, repoName } = this.state;

    if (e !== status) {
      const issues = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state: e,
          per_page: 30,
          page: 1,
        },
      });

      this.setState({ issues: issues.data, status: e });
    }
  };

  render() {
    const { repository, issues, loading, page, status } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos Repositoriis</Link>
          <img src={repository.owner.avatar_url} alt="repository.owner.login" />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <header>
            <button
              disabled={page === 1}
              onClick={() => this.handleChangePage(-1)}
            >
              Anterior
            </button>
            <div>
              <button
                disabled={status === 'all'}
                onClick={() => this.handleTypeList('all')}
              >
                All
              </button>
              <button
                disabled={status === 'open'}
                onClick={() => this.handleTypeList('open')}
              >
                Open
              </button>
              <button
                disabled={status === 'closed'}
                onClick={() => this.handleTypeList('closed')}
              >
                Closed
              </button>
            </div>
            <button
              disabled={issues.length !== 30}
              onClick={() => this.handleChangePage(1)}
            >
              Proximo
            </button>
          </header>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
