import type { FrameReducer, NextServerPageProps } from "frames.js/next/server";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";

import { createDebugUrl, DEFAULT_DEBUGGER_HUB_URL } from "./debug";
import {
  getDaoSlug,
  resetCursor,
  setCursor,
  setDaoId,
  setDaoSlug,
  setGovernorId,
  setOrganizationId,
} from "./lib/data";
import { ellipsisAddress } from "./lib/ellipsisAddress";
import { formatNumber } from "./lib/formatNumber";
import { isObjectEmpty } from "./lib/isEmpty";
import { fetchDaoResults } from "./lib/tallyDaoSearch";
import { fetchSearchResults } from "./lib/tallyDelegateSearch";
import type { SearchResultType, TallyOrgType } from "./lib/types";
import { currentURL } from "./utils";

type State = {
  page: string;
  active: string;
  total_button_presses: number;
};

const initialState: State = {
  page: "initial",
  active: "1",
  total_button_presses: 0,
} as const;

let frame: React.ReactElement;

const reducer: FrameReducer<State> = (state, action) => {
  const buttonIndex = action.postBody?.untrustedData.buttonIndex;

  switch (state.page) {
    case "initial":
      return buttonIndex === 1
        ? {
            page: "daofound",
            total_button_presses: state.total_button_presses + 1,
            active: action.postBody?.untrustedData.buttonIndex
              ? String(action.postBody?.untrustedData.buttonIndex)
              : "1",
          }
        : state;
    case "daofound":
      switch (buttonIndex) {
        case 1:
          // reset session kv
          resetCursor(String(action.postBody?.untrustedData.fid));
          return buttonIndex === 1
            ? {
                page: "initial",
                total_button_presses: state.total_button_presses + 1,
                active: action.postBody?.untrustedData.buttonIndex
                  ? String(action.postBody?.untrustedData.buttonIndex)
                  : "1",
              }
            : state;
        case 2:
          return buttonIndex === 2
            ? {
                page: "listdelegates",
                total_button_presses: state.total_button_presses + 1,
                active: action.postBody?.untrustedData.buttonIndex
                  ? String(action.postBody?.untrustedData.buttonIndex)
                  : "2",
              }
            : state;
      }
    case "listdelegates":
      switch (buttonIndex) {
        case 1:
          return buttonIndex === 1
            ? {
                page: "listdelegates",
                total_button_presses: state.total_button_presses + 1,
                active: action.postBody?.untrustedData.buttonIndex
                  ? String(action.postBody?.untrustedData.buttonIndex)
                  : "1",
              }
            : state;
        case 2:
          // reset session kv
          resetCursor(String(action.postBody?.untrustedData.fid));
          return buttonIndex === 2
            ? {
                page: "initial",
                total_button_presses: state.total_button_presses + 1,
                active: action.postBody?.untrustedData.buttonIndex
                  ? String(action.postBody?.untrustedData.buttonIndex)
                  : "2",
              }
            : state;
        case 3:
          // reset session kv
          resetCursor(String(action.postBody?.untrustedData.fid));
          return buttonIndex === 3
            ? {
                page: "initial",
                total_button_presses: state.total_button_presses + 1,
                active: action.postBody?.untrustedData.buttonIndex
                  ? String(action.postBody?.untrustedData.buttonIndex)
                  : "3",
              }
            : state;
      }
    case "notfound":
      return buttonIndex === 1
        ? { page: "notfound", active: "1", total_button_presses: 0 }
        : state;
    default:
      return { page: "initial", active: "1", total_button_presses: 0 };
  }
};

// This is a react server component only
export default async function Home({ searchParams }: NextServerPageProps) {
  const url = currentURL("/");
  const previousFrame = getPreviousFrame<State>(searchParams);

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    hubHttpUrl: DEFAULT_DEBUGGER_HUB_URL,
  });

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame,
  );

  console.log("info: state is:", state);
  const baseUrl = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";
  console.log("info: baseUrl is:", baseUrl);

  function isTallyOrgType(value: any): value is TallyOrgType {
    return value && typeof value === "object" && "name" in value;
  }

  // Function to fetch dao info results or return a default value
  async function getDaoResult(
    state: any,
    previousFrame: any,
  ): Promise<TallyOrgType> {
    const result =
      state?.page === "daofound"
        ? await fetchDaoResults(
            String(previousFrame.postBody?.untrustedData.inputText),
          )
        : {
            // Default values for TallyOrgType
          };

    if (isTallyOrgType(result)) {
      var governanceInfo_0 = result.governanceInfo[0] ?? {};

      setDaoSlug(
        String(previousFrame.postBody?.untrustedData.fid),
        result.slug,
      );
      setOrganizationId(
        String(previousFrame.postBody?.untrustedData.fid),
        result.id,
      );

      setDaoId(
        String(previousFrame.postBody?.untrustedData.fid),
        String(governanceInfo_0.daoId),
      );
      //--

      if (
        previousFrame.postBody?.untrustedData.fid &&
        result.governanceInfo?.length
      ) {
        var govIds: string[] = [];
        previousFrame.postBody?.untrustedData.fid,
          result.governanceInfo?.map((govId) => {
            govIds.push(String(govId.governorId));
          });
        setGovernorId(
          String(previousFrame.postBody?.untrustedData.fid),
          govIds.join("|"),
        );
      } else {
        setGovernorId(
          String(previousFrame.postBody?.untrustedData.fid),
          String(governanceInfo_0.governorId),
        );
      }

      return result;
    } else {
      //throw new Error("Result is not of type TallyOrgType");
      console.log("Result is not of type TallyOrgType");
      return {} as TallyOrgType;
    }
  }

  const orgFound: TallyOrgType = await getDaoResult(state, previousFrame);

  const daoSlug = await getDaoSlug(
    String(previousFrame.postBody?.untrustedData.fid),
  );

  function isSearchResultType(value: any): value is SearchResultType {
    return value && typeof value === "object" && "name" in value;
  }

  // Function to fetch profile results or return a default value
  async function getSearchResult(
    state: any,
    previousFrame: any,
  ): Promise<SearchResultType> {
    const result =
      state?.page === "listdelegates"
        ? await fetchSearchResults(
            String(previousFrame.postBody?.untrustedData.fid),
          )
        : {
            // Default values for SearchResultType
          };

    if (isSearchResultType(result)) {
      await setCursor(
        previousFrame.postBody?.untrustedData.fid,
        String(result.firstCursor),
      );
      return result;
    } else {
      //throw new Error("Result is not of type SearchResultType");
      console.log("Result is not of type SearchResultType");
      return {} as SearchResultType;
    }
  }

  const searchResult: SearchResultType =
    state?.page === "listdelegates"
      ? await getSearchResult(state, previousFrame)
      : {
          // Default values for SearchResultType
        };

  const initialPage = (
    <FrameContainer
      postUrl="/frames"
      pathname="/"
      state={state}
      previousFrame={previousFrame}
    >
      <FrameImage key="landing-image" aspectRatio="1.91:1">
        <div
          style={{
            display: "flex",
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            backgroundImage: "linear-gradient(to bottom, #725bff, #7274ff)",
            fontSize: 40,
            color: "white",
            padding: "2rem",
            letterSpacing: 1,
            fontWeight: 400,
            textAlign: "center",
            gap: "1rem",
          }}
        >
          <img
            src={`${baseUrl}/tally-logo.png`}
            width={256}
            height={256}
            alt="tally logo"
            tw="mt-3"
          />
          <h1 tw="-mt-3">Delegates Seeking Delegation</h1>
        </div>
      </FrameImage>
      <FrameInput text="What's the DAO name?" />
      <FrameButton key="search-button">🔍 Search</FrameButton>
    </FrameContainer>
  );

  const notfoundPage = (
    <FrameContainer
      postUrl="/frames"
      pathname="/"
      state={state}
      previousFrame={previousFrame}
    >
      <FrameImage key="search-notfound" aspectRatio="1.91:1">
        <div
          tw="flex w-full h-full"
          style={{
            backgroundImage: "linear-gradient(to bottom, #725bff, #1d173f)",
          }}
        >
          <div tw="flex flex-col w-full h-full items-center justify-center">
            <h2 tw="flex flex-col text-[164px] font-bold tracking-tight text-white">
              <span tw="items-center justify-center pb-6">Oops!</span>
              <span tw="text-red-200 text-5xl pb-3">
                Sorry! we are unable to find what you are looking for...
              </span>
              <span tw="items-center justify-center text-5xl text-indigo-100">
                Check your input and try again!
              </span>
            </h2>
          </div>
        </div>
      </FrameImage>
      <FrameButton key="tryagain-button" target={"/frames?reset=true"}>
        Try again
      </FrameButton>
    </FrameContainer>
  );

  const daoFoundPage = (
    <FrameContainer
      postUrl="/frames"
      pathname="/"
      state={state}
      previousFrame={previousFrame}
    >
      <FrameImage key="daofound-result" aspectRatio="1.91:1">
        <div tw="flex flex-col border bg-white w-full p-21">
          <div tw="flex items-start">
            <div tw="flex shrink-0">
              <img
                alt="dao icon"
                tw="h-48 w-48 mr-3 rounded-full"
                height="36"
                src={orgFound?.metadata?.icon}
                style={{
                  objectFit: "cover",
                }}
                width="36"
              />
            </div>
            <div tw="flex flex-col flex-1 min-w-0">
              <p
                style={{ fontWeight: "800" }}
                tw={`text-[80px] font-bold leading-5 text-gray-900 ${orgFound.hasActiveProposals === true ? "" : "mt-21"}`}
              >
                {orgFound?.name}
              </p>
              {orgFound.hasActiveProposals ? (
                <p tw="mt-1 p-3 text-[36px] items-center max-w-lg rounded-lg font-bold leading-5 text-[#725bff] bg-[#ebe5ff]">
                  <span tw="text-[72px]">🗳️</span>ACTIVE PROPROSAL(s)
                </p>
              ) : null}
            </div>
          </div>
          <div tw="flex -mt-3">
            <p tw="max-h-[233px] text-[38px] flex leading-10 text-gray-900 overflow-hidden">
              {orgFound?.metadata?.description}
            </p>
          </div>
          <div tw="flex items-center justify-between">
            <p tw="flex text-[34px] leading-5">
              Proposals:{" "}
              <span tw="ml-3 mr-6 font-bold text-[#05a981]">
                {orgFound?.proposalsCount}
              </span>{" "}
              Voters:{" "}
              <span tw="font-bold text-green-500 ml-3">
                {orgFound?.votersCount}
              </span>
            </p>
          </div>
        </div>
      </FrameImage>

      {state?.page === "daofound" && !isObjectEmpty(orgFound) ? (
        <FrameButton key="searchagain-button">🔍 Search again</FrameButton>
      ) : null}

      {state?.page === "daofound" && !isObjectEmpty(orgFound) ? (
        <FrameButton key="browse-button">🧭 Browse Delegates</FrameButton>
      ) : null}
    </FrameContainer>
  );

  const resultPageProfile = (
    <FrameContainer
      postUrl="/frames"
      pathname="/"
      state={state}
      previousFrame={previousFrame}
    >
      <FrameImage key="profilefound-result" aspectRatio="1.91:1">
        <div tw="flex flex-col border bg-white p-21">
          <div tw="flex items-start mt-8">
            <div tw="flex shrink-0">
              <img
                alt="profile avatar"
                tw="h-36 w-36 rounded-full mr-6"
                height="36"
                src={
                  searchResult?.picture
                    ? searchResult?.picture
                    : `https://effigy.im/a/${searchResult?.address}.png`
                }
                style={{
                  objectFit: "cover",
                }}
                width="36"
              />
            </div>
            <div tw="flex flex-col flex-1 min-w-0">
              <p tw="text-[64px] font-medium leading-5 text-gray-900">
                {searchResult?.name !== ""
                  ? searchResult?.name
                  : searchResult?.ens
                    ? searchResult?.ens
                    : ellipsisAddress(String(searchResult?.address))}
              </p>
              <p tw="mt-1 text-[48px] leading-5 text-gray-500">
                {searchResult?.votes ? formatNumber(searchResult?.votes) : 0}{" "}
                {searchResult?.tokenSymbol}
              </p>
            </div>
          </div>
          <div tw="flex -mt-6">
            <p tw="max-h-[233px] text-[38px] flex leading-10 text-gray-900 overflow-hidden">
              {searchResult?.statementSummary
                ? searchResult?.statementSummary
                : searchResult?.bio
                  ? searchResult?.bio
                  : "No existing statement or bio..."}
            </p>
          </div>
          <div tw="flex items-center justify-between">
            <p tw="flex text-[38px] leading-5 text-[#725bff]">
              Trusted by {searchResult?.delegatorsCount} accounts
            </p>
          </div>
        </div>
      </FrameImage>

      {state?.page === "listdelegates" && searchResult?.lastCursor ? (
        <FrameButton key="next-button">Next →</FrameButton>
      ) : null}

      {state?.page === "listdelegates" && searchResult?.firstCursor ? (
        <FrameButton
          key="delegate-button"
          action="link"
          target={`https://www.tally.xyz/gov/${daoSlug}/delegate/${searchResult?.address}`}
        >
          Delegate
        </FrameButton>
      ) : null}

      <FrameButton key="reset-button">🔴 Reset</FrameButton>
    </FrameContainer>
  );

  switch (state.page) {
    case "initial":
      return (frame = initialPage);
    case "daofound":
      frame = !isObjectEmpty(orgFound) ? daoFoundPage : notfoundPage;
      return frame;
    case "listdelegates":
      // if retry is true, then try to generate again and show checkStatusFrame
      if (searchParams?.reset === "true") {
        // reset to initial state
        resetCursor(String(previousFrame.postBody?.untrustedData.fid));
        frame = initialPage;
        return frame;
      } else {
        frame = searchResult?.firstCursor ? resultPageProfile : notfoundPage;
        return frame;
      }
    case "notfound":
      frame = notfoundPage;
      return frame;
    default:
      return (frame = initialPage);
  }

  /*if state?.page === "initial" ? initialPage : null}
  {state?.page === "daofound" && !isObjectEmpty(orgFound)
    ? daoFoundPage
    : null}
  {state?.page === "daofound" && isObjectEmpty(orgFound)
    ? notfoundPage
    : null}
  {state?.page === "listdelegates" && searchResult?.firstCursor
    ? resultPageProfile
    : null}
  {state?.page === "listdelegates" && !searchResult?.firstCursor
    ? notfoundPage
    : null}*/

  // then, when done, return next frame
  return (
    <div className="p-4">
      frames.js starter kit. The Template Frame is on this page, it&apos;s in
      the html meta tags (inspect source).{" "}
      <Link href={createDebugUrl(url)} className="underline">
        Debug
      </Link>
      {frame}
    </div>
  );
}
