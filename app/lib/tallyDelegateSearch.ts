import { getCursor, getDaoId, getGovernorId, getOrganizationId } from "./data";
import type { SearchResultType } from "./types";

export async function fetchSearchResults(fid: string) {
  if (fid === null || fid === "" || fid === undefined) {
    return [];
  }
  let cursor = await getCursor(fid);
  if (cursor === "" || cursor === "undefined") {
    cursor = null;
  }
  // default dao (arbitrum) if dao slug or chainId not defined
  const daoId = (await getDaoId(fid)) ?? "eip155:42161";
  const governorIds =
    String(await getGovernorId(fid)).split("|") ??
    "eip155:42161:0x789fC99093B09aD01C34DC7251D0C89ce743e5a4|eip155:42161:0xf07DeD9dC292157749B6Fd268E37DF6EA38395B9";
  const organizationId =
    (await getOrganizationId(fid)) ?? "2206072050315953936";

  if (fid && organizationId) {
    console.log("fetchSearchResults cursor: ", cursor);
    let governorId: string | undefined | null;

    if (governorIds?.length > 1) {
      governorId = governorIds[0];
    } else {
      governorId = governorIds[0];
    }

    const response = await fetch("https://api.tally.xyz/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.TALLY_API_KEY || "",
      },
      body: JSON.stringify({
        query: `
        query Delegates($input: DelegatesInput!, $governorId: AccountID!, $proposalsCreatedCountInput: ProposalsCreatedCountInput!) {
          delegates(input: $input) {
            nodes {
              ... on Delegate {
                id
                account {
                  address
                  bio
                  email
                  picture
                  name
                  twitter
                  ens
                  type
                  isOFAC
                  votes(governorId: $governorId)
                  proposalsCreatedCount(input: $proposalsCreatedCountInput)
                }
                delegatorsCount
                votesCount
                token {
                  id
                  name
                  symbol
                  decimals
                }
                statement {
                  id
                  address
                  organizationID
                  issues {
                    id
                    name
                    organizationId
                    description
                  }
                  statementSummary
                  dataSource
                  dataSourceURL
                  discourseUsername
                  discourseProfileLink
                  isSeekingDelegation
                }
              }
            }
            pageInfo {
              firstCursor
              lastCursor
            }
          }
        }`,
        variables: {
          governorId: governorId,
          proposalsCreatedCountInput: {
            governorId: governorId,
          },
          input: {
            filters: {
              governanceId: governorId,
              organizationId: organizationId,
              isSeekingDelegation: true,
            },
            page: {
              afterCursor: cursor,
              limit: 2,
            },
            sort: {
              isDescending: true,
              sortBy: "VOTES",
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    const _searchResult = data?.data?.delegates?.nodes[0] ?? [];
    const _pageInfo = data?.data?.delegates?.pageInfo;
    const searchResult: SearchResultType = {
      id: _searchResult?.id,
      name: _searchResult?.account?.name,
      picture: _searchResult?.account?.picture,
      bio: _searchResult?.account?.bio,
      address: _searchResult?.account?.address,
      ens: _searchResult?.account?.ens,
      votes: _searchResult?.account?.votes,
      tokenSymbol: _searchResult?.token?.symbol,
      tokenDecimals: _searchResult?.token?.decimals,
      statementSummary: _searchResult?.statement?.statementSummary,
      delegatorsCount: _searchResult?.delegatorsCount,
      firstCursor: _pageInfo?.firstCursor,
      lastCursor: _pageInfo?.lastCursor,
    };
    console.log("data QUERY ", data);
    return searchResult; // Return search result
  } else {
    console.log("ERROR Delegate not found!");
    console.log("The string is invalid.");
    return [];
  }
}
