import requests
import sys
import json

def geocode_address(address):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": address,  # Free-form query
        "format": "json",
        "addressdetails": 1,
        "limit": 1,
    }
    headers = {
        "User-Agent": "Phillow/1.0 (xiaoshenma2016@gmail.com)"  # Ensure this matches the successful curl request
    }
    try:
        response = requests.get(url, params=params, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data:
                lat = data[0]["lat"]
                lon = data[0]["lon"]
                display_name = data[0]["display_name"]
                return {"latitude": lat, "longitude": lon, "display_name": display_name}
            else:
                return {"error": "Address not found"}
        else:
            return {"error": f"Request failed with status code {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    address = " ".join(sys.argv[1:])  # Combine command-line args into one string
    result = geocode_address(address)
    print(json.dumps(result))  # Output valid JSON