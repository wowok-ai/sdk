"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRAPHQL_OBJECTS = exports.GRAPHQL_OWNER = exports.GRAPHQL_OBJECT = exports.GRAPHQL_OBJECTS_TYPE = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.GRAPHQL_OBJECTS_TYPE = (0, graphql_tag_1.gql)(`
 query objects_type_version($filter:ObjectFilter!) {
  objects(filter:$filter) {
    nodes {
      address
      version
      asMoveObject {
        contents {
          type {
            repr
          }
        }
    }
    }
  }
}
`);
exports.GRAPHQL_OBJECT = (0, graphql_tag_1.gql)(`
  query object($ObjectID:SuiAddress!) {
    object(address:$ObjectID)  {
      address
      asMoveObject {
        contents {
          json
          type {
            repr
          }
        }
      }
      dynamicFields {
        pageInfo {
            hasNextPage
            endCursor
        }
        nodes {
          name {
            json
          }
          value {
            ... on MoveValue {
              json
            }
            ... on MoveObject {
              contents {
                json
              }
            }
          }
        }
      }
    }
  }
`);
exports.GRAPHQL_OWNER = (0, graphql_tag_1.gql)(`
  query owner($ObjectID:SuiAddress!) {
    owner (address: $ObjectID) {
        address
        dynamicFields {
          pageInfo {
            hasNextPage
            endCursor
            }
            nodes {
                name {
                    json
                }
                value {
                ... on MoveValue {
                    json
                }
                ... on MoveObject {
                    contents {
                    json
                    }
                }
                }
            }
        }
    }
    }
`);
exports.GRAPHQL_OBJECTS = (0, graphql_tag_1.gql)(`
  query objects($filter:ObjectFilter!){
    objects(filter:$filter) {
      nodes {
        address
            asMoveObject {
        contents {
          json
          type {
            repr
          }
        }
      }
      }
  }
  }
`);
