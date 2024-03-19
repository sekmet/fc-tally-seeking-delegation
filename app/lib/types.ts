export type SearchResultType = {
  id?: string;
  name?: string;
  picture?: string;
  bio?: string;
  address?: string;
  ens?: string;
  votes?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  statementSummary?: string;
  delegatorsCount?: number;
  firstCursor?: string;
  lastCursor?: string;
};

export type DelegateInputType = {
  daoId?: string;
  governorId?: string;
  cursor?: string;
};

export type SearchInputType = {
  daoOrChainID?: string;
  address?: string;
  ens?: string;
};

type TallyOrgMetadata = {
  icon?: string;
  color?: string;
  description?: string;
};

export type TallyOrgGovernance = {
  daoId?: string;
  governorId?: string;
};

export type TallyOrgType = {
  id: string;
  slug: string;
  name: string;
  proposalsCount?: number;
  hasActiveProposals?: boolean;
  tokenHoldersCount?: number;
  votersCount?: number;
  metadata: TallyOrgMetadata;
  governanceInfo: TallyOrgGovernance[];
};
