const { paginateResults } = require("./utils");
module.exports = {
  Query: {
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
      const allLaunches = await dataSources.launchApi.getAllLaunches();
      // we want these in reverse chronological order
      allLaunches.reverse();

      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches,
      });

      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor at the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !==
            allLaunches[allLaunches.length - 1].cursor
          : false,
      };
    },
    launch: (_parent, { id }, { dataSources }) =>
      dataSources.launchApi.getLaunchById({ launchId: id }),
    me: (_parent, { email }, { dataSources }) =>
      dataSources.userApi.findOrCreateUser({ email }),
  },
  Launch: {
    // the parent launch is the one returned from launch query, so it goes already through the adapter method
    // therefore it contains all the fields defined there except for isBooked,
    // which needs to be returned from User class avaiable through context.dataSources
    isBooked: (launch, _args, { dataSources }) =>
      dataSources.userApi.isBookedOnLaunch(launch.id),
  },
  Mission: {
    // The default size is 'LARGE' if not provided
    missionPatch: (mission, { size } = { size: "LARGE" }) => {
      return size === "SMALL"
        ? mission.missionPatchSmall
        : mission.missionPatchLarge;
    },
  },
  User: {
    trips: (me, _args, { dataSources }, _info) => {
      const launchIds = dataSources.userApi.getLaunchIdsByUser();
      if (!launchIds.lenghts) return [];
      return dataSources.launchApi.getLaunchesByIds(launchIds);
    },
  },
};
