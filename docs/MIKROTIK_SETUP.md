# MikroTik Router Setup for ConnectPoint

This guide explains how to configure your MikroTik router to work with ConnectPoint's hotspot management and RADIUS authentication.

## Prerequisites

- MikroTik RouterBOARD or Cloud Core Router running RouterOS v7+
- WinBox or SSH access to the router
- Internet connection on the router
- ConnectPoint backend server IP address (or FreeRADIUS VPS IP)

## Option 1: RADIUS Authentication (Recommended)

### Step 1: Configure your MikroTik as RADIUS Client

Connect via WinBox or SSH and run:

```bash
# Add RADIUS server for authentication
/radius add address=YOUR_CONNECTPOINT_SERVER_IP secret=testing123 service=hotspot timeout=3000ms

# Add RADIUS server for accounting
/radius add address=YOUR_CONNECTPOINT_SERVER_IP secret=testing123 service=hotspot accounting-port=1813 timeout=3000ms
```

### Step 2: Configure Hotspot Profile

```bash
# Create or edit hotspot profile to use RADIUS
/ip hotspot profile set [find] use-radius=yes

# Optional: Configure hotspot profile settings
/ip hotspot profile set [find] 
    hotspot-address=192.168.88.1 
    dns-name=connectpoint.local 
    html-directory=hotspot 
    login-by=http-pap 
    use-radius=yes
```

### Step 3: Set Up Hotspot Server

```bash
# Create hotspot on your LAN interface
/ip hotspot setup
# Follow prompts:
# - Hotspot interface: ether2 (or your LAN interface)
# - Local address of network: 192.168.88.1/24
# - DHCP server: yes
# - Address pool: 192.168.88.2-192.168.88.254
# - DNS servers: 8.8.8.8, 1.1.1.1
```

### Step 4: Test the Connection

```bash
# Check RADIUS server status
/radius print

# Expected output shows your server with status "running"
# Columns: ID, SERVICE, ADDRESS, SECRET, STATUS

# Monitor authentication attempts
/log print where topics~"radius"
```

## Option 2: MikroTik User Manager (Built-in RADIUS)

User Manager is a built-in RADIUS server in RouterOS v7+. It's simpler and doesn't require a separate FreeRADIUS server.

### Enable User Manager

```bash
# Enable User Manager
/user-manager enabled set enabled=yes

# Create a router entry for ConnectPoint
/user-manager router add 
    name=connectpoint-backend 
    address=YOUR_CONNECTPOINT_SERVER_IP 
    shared-secret=testing123
```

### Configure Hotspot to Use User Manager

```bash
# Add User Manager as RADIUS server
/radius add 
    address=127.0.0.1 
    secret=testing123 
    service=hotspot 
    called-id=UserManager

# Enable RADIUS on hotspot profile
/ip hotspot profile set [find] use-radius=yes
```

## Captive Portal Customization

ConnectPoint handles the captive portal page. You can redirect to the ConnectPoint portal:

```bash
# Set hotspot to redirect to ConnectPoint captive portal
/ip hotspot walled-garden ip add 
    dst-host=YOUR_CONNECTPOINT_DOMAIN 
    action=allow

# Configure hotspot HTML directory to show minimal redirect
/ip hotspot profile set [find] html-directory=hotspot
```

### Upload ConnectPoint Portal Redirect

Create a minimal `hotspot/index.html` that redirects to ConnectPoint:

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=https://connectpoint.io/portal/ROUTER_ID">
</head>
<body>
    <p>Redirecting to ConnectPoint portal...</p>
</body>
</html>
```

Upload via WinBox: Files â†’ drag `index.html` into the hotspot directory.

## RADIUS Attributes

ConnectPoint sets the following RADIUS attributes on user authentication:

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `Cleartext-Password` | Generated password | User authentication |
| `Max-All-Session` | Time in seconds | Session time limit |
| `Max-Octets` | Bytes | Data transfer limit |
| `MikroTik-Rate-Limit` | e.g. `1M/1M` | Bandwidth limit (upload/download) |
| `Acct-Interim-Interval` | 300 seconds | Accounting update interval |

## Troubleshooting

### No RADIUS authentication happening

```bash
# Check RADIUS configuration
/radius print detail

# Test RADIUS connectivity
/tool radius scan

# Check firewall isn't blocking UDP 1812/1813
/ip firewall filter print
```

### Users not disconnected on expiry

```bash
# Ensure RADIUS accounting is working
/radius print where service=hotspot
# Check the "accounting-port" column

# Enable interim accounting updates
/radius set [find] interim-update=yes interim-interval=30s
```

### Session data not syncing

```bash
# Check accounting packets are being sent
/log print where topics~"radius,accounting"

# Test with a manual accounting packet:
/tool radius accounting 
    called-station-id=AA:BB:CC:DD:EE:FF 
    calling-station-id=11:22:33:44:55:66 
    user=testuser 
    input-octets=1000 
    output-octets=2000 
    session-time=60
```

## Bandwidth Management Examples

Configure rate limiting via MikroTik:

```bash
# Example: Limit each user to 1Mbps download / 512kbps upload
/ip hotspot user profile add 
    name=1mbps 
    rate-limit=1M/512k 
    shared-users=1 
    add-mac-cookie=yes

# Apply profile to RADIUS users
/radius incoming set accept=yes
```

ConnectPoint can push bandwidth limits via `MikroTik-Rate-Limit` attribute:
- Value format: `{upload speed}k/{download speed}k` (kilobits)
- Example: `1024k/2048k` = 1Mbps upload, 2Mbps download

## Support

For additional help:
- MikroTik documentation: https://wiki.mikrotik.com
- ConnectPoint documentation: https://docs.connectpoint.io
- Email: support@connectpoint.io
