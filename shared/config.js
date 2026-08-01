const CONFIG = {
  BASE_URL:
    "https://grabandgo-api.agreeablemeadow-08ae7a0a.uaenorth.azurecontainerapps.io/api",
  HUB_URL:
    "https://grabandgo-api.agreeablemeadow-08ae7a0a.uaenorth.azurecontainerapps.io/hubs/cart",
  GATE_HUB_URL:
    "https://grabandgo-api.agreeablemeadow-08ae7a0a.uaenorth.azurecontainerapps.io/hubs/gate",
  INVOICE_HUB_URL:
    "https://grabandgo-api.agreeablemeadow-08ae7a0a.uaenorth.azurecontainerapps.io/hubs/invoice",
  // Intentionally public demo-only credentials.
  // These simulate trusted hardware and must not be reused in production
  GATE_API_KEY: "gZi+LvgBIMSOwGfklXKPjGavVMu1lIIc40vrayzmkX0=",
  Vision_API_KEY: "zxSMBswTfM3V8c3H1sN/JjTNAq+7SpoqUm8yG+ZhFrM=",
  TOKEN_KEY: "gg_token",
  USER_KEY: "gg_user",
  TRACK_KEY: "gg_track_id",
  Broker: {
    Host: "wss://303d1530cfe34f16836e459235623f60.s1.eu.hivemq.cloud:8884/mqtt",
    // Intentionally public demo-only MQTT publisher credentials.
    // This account should have publish-only access to the single demo topic.
    Username: "grabandgo_demo_controller",
    Password: "GrabAndGo123",
    Topic: "grabandgo/dev/store/SWFI/vision/events/interaction",
  },
};
