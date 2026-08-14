# Demo script — Imbizo Shisanyama Inventory (10 minutes)

Use this order. It matches how the business works today: delivery arrives, staff count, manager signs off, stock is updated.

## Before you start

1. SQL, API, and frontend must be running.
2. Open **http://localhost:3000/login**
3. Have two browser profiles or use Sign out between roles (simplest).

## Story to tell

> “Today stock is counted on paper. The manager signs a delivery note. Nobody can see live stock, low stock, or who approved what. This POC replaces that paper trail.”

## Flow 1 — Receiver captures a delivery (3 min)

Login as **Receiver**

- Email: `receiver@imbizo.co.za`
- Password: `Receiver@123`

1. Show **Dashboard** briefly (they can see alerts, but they cannot approve).
2. Go to **Inventory**. Point out Coca-Cola 2L is **Low Stock**.
3. Go to **Stock Receiving** → **Record Delivery**.
4. Fill:
   - Supplier: **Cape Meat Wholesalers** (or SAB if showing drinks)
   - Reference: `DEL-DEMO-001`
   - Date: today
   - Signature: `Nomsa Dlamini`
   - Item: **Beef Short Ribs** (or Coca-Cola 2L)
   - Qty delivered: `15`
   - Qty damaged: `0`
5. Optionally attach any photo/PDF as the invoice.
6. Click **Submit for Approval**.

What to say: “The delivery is now pending. Inventory has **not** changed yet. Only a manager can release stock.”

## Flow 2 — Manager approves (3 min)

Sign out. Login as **Store Manager**

- Email: `manager@imbizo.co.za`
- Password: `Manager@123`

1. Dashboard: **Pending Approvals** should be 1 or more.
2. Click **Pending Approvals** or open the delivery.
3. Show receiver name + signature (accountability).
4. Click **Approve**. Stay on the page — status becomes Approved.
5. Go to **Inventory** and show the quantity increased.
6. Go to **Stock Movements** and show an **Incoming** line for that delivery.

What to say: “Approval is the digital signature. Stock only moves after the manager confirms.”

## Flow 3 — Kitchen usage / wastage (2 min)

Stay as manager, or login as **Kitchen** (`kitchen@imbizo.co.za` / `Kitchen@123`).

1. **Stock Movements** → Record movement
2. Item: Chicken Wings
3. Type: **Wastage**
4. Qty: `2`
5. Notes: `Prep spoilage`
6. Save, then show Before → After.

## Flow 4 — Reports for the owner (2 min)

1. **Reports** → Generate **Low Stock** and **Stock Valuation**
2. Show CSV export (Excel) and print.

Close with: “Every action is timestamped and tied to a user. That is the replacement for the paper file.”

## If something looks empty

- Pending delivery from seed: `DEL-2026-001` should already exist for Cape Meat.
- Demo accounts are listed on the login page — click to fill.
