import * as SunCalc from 'suncalc';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeoService {
  private logger = new Logger(GeoService.name);

  getSunsetPosition(params: {
    sunset: number;
    lat: number;
    lon: number;
    distanceKm: number;
  }) {
    const { distanceKm, lat, lon, sunset } = params;
    const sunPosition = SunCalc.getPosition(sunset, lat, lon);
    const sunriseAzimuth = sunPosition.azimuth - Math.PI;

    const radiusEarthKilometres = 6371.01;
    const distRatio = distanceKm / radiusEarthKilometres;
    const distRatioSine = Math.sin(distRatio);
    const distRatioCosine = Math.cos(distRatio);

    const startLatRad = toRad(lat);
    const startLonRad = toRad(lon);

    const startLatCos = Math.cos(startLatRad);
    const startLatSin = Math.sin(startLatRad);

    const endLatRads = Math.asin(
      startLatSin * distRatioCosine +
        startLatCos * distRatioSine * Math.cos(sunriseAzimuth),
    );

    const endLonRads =
      startLonRad +
      Math.atan2(
        Math.sin(sunriseAzimuth) * distRatioSine * startLatCos,
        distRatioCosine - startLatSin * Math.sin(endLatRads),
      );

    this.logger.debug(
      `Sunset position for "${lat},${lon}" will be "${toDegrees(
        endLatRads,
      )},${toDegrees(endLonRads)}"`,
    );
    return { lat, lon };
  }
}

function toRad(degrees: number) {
  return degrees * (Math.PI / 180);
}

function toDegrees(rad: number) {
  return (rad * 180) / Math.PI;
}
