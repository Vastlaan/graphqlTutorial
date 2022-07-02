const { RESTDataSource } = require("apollo-datasource-rest");
class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.spacexdata.com/v2/";
  }

  async getAllLaunches() {
    try {
      const allLaunches = await this.get("launches");
      return Array.isArray(allLaunches)
        ? this.launchSchemaAdapter(allLaunches)
        : [];
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getLaunchById({ launchId }) {
    try {
      const response = await this.get("launches", { flight_number: launchId });
      if (response.length === 0) {
        return null;
      }
      return this.launchSchemaAdapter(response)[0];
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  getLaunchesByIds(launchIds) {
    return Promise.all(
      launchIds.map((launchId) => {
        return this.getLaunchById(launchId);
      })
    );
  }

  launchSchemaAdapter(launches) {
    return launches.map((launch) => ({
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    }));
  }
}
module.exports = LaunchAPI;
