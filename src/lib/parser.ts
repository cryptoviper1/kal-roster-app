import { AIRPORT_TZ, PER_DIEM_RATES, EURO_CITIES, KOREA_PORTS, SIM_KEYWORDS } from './constants';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export function getRateInfo(city: string) {
  let currency = "$";
  let rate = 2.16;
  if (PER_DIEM_RATES[city]) {
    rate = PER_DIEM_RATES[city];
  } else {
    if (["NRT", "HND", "KIX", "NGO", "FUK", "CTS"].some(jp => city.includes(jp))) rate = 2.72;
    else if (["PEK", "PVG", "CAN", "SZX"].some(cn => city.includes(cn))) rate = 1.95;
  }
  if (EURO_CITIES.includes(city)) currency = "€";
  return { rate, currency };
}

export function formatDuration(ms: number) {
  let total = Math.abs(Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function getUtcTime(dtStr: string, airportCode: string): Date | null {
  try {
    const tz = AIRPORT_TZ[airportCode] || 'Asia/Seoul';
    // date-fns-tz needs a specific format to parse correctly in a timezone if not ISO
    // But standard JS can do it if formatted well:
    // This is a naive way assuming dtStr is "YYYY-MM-DD HH:mm"
    const [datePart, timePart] = dtStr.split(' ');
    const isoString = `${datePart}T${timePart}:00`;
    // We create a date in the given timezone, then convert to UTC
    // A trick: Construct the string with offset
    const d = new Date(new Date(isoString).toLocaleString('en-US', { timeZone: tz }));
    const offsetCalc = new Date(isoString).getTime() - d.getTime();
    return new Date(new Date(isoString).getTime() + offsetCalc);
  } catch {
    return null;
  }
}

function normalizeDetailedText(text: string): string[] {
  const parsedLines: string[] = [];
  for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.includes('\t')) {
          parsedLines.push(...trimmed.split('\t').map(x => x.trim()).filter(x => x));
          continue;
      }
      
      const fltMatch = trimmed.match(/^([A-Z0-9]{2,8})\s+([A-Z]{3})\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\s+([A-Z]{3})\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})(?:\s+([A-Z0-9]{2,4}))?(?:\s+(.*))?$/);
      if (fltMatch) {
          parsedLines.push(fltMatch[1], fltMatch[2], fltMatch[3], fltMatch[4], fltMatch[5]);
          if (fltMatch[6]) parsedLines.push(fltMatch[6]);
          if (fltMatch[7]) {
              const crewMatch = fltMatch[7].match(/^(CAP|FO|FS|CS|SS|PUR|INT|CC)\s+(?:([A-Z]+)\s+)?(?:([PF]\d)\s+)?([A-Z]?\d{6,7})\s+(.*)$/);
              if (crewMatch) {
                  parsedLines.push(crewMatch[1]);
                  if (crewMatch[2]) parsedLines.push(crewMatch[2]);
                  if (crewMatch[3]) parsedLines.push(crewMatch[3]);
                  parsedLines.push(crewMatch[4]);
                  parsedLines.push(crewMatch[5]);
              } else {
                  parsedLines.push(...fltMatch[7].split(/\s+/));
              }
          }
          continue;
      }
      
      const crewMatch = trimmed.match(/^(CAP|FO|FS|CS|SS|PUR|INT|CC)\s+(?:([A-Z]+)\s+)?(?:([PF]\d)\s+)?([A-Z]?\d{6,7})\s+(.*)$/);
      if (crewMatch) {
          parsedLines.push(crewMatch[1]);
          if (crewMatch[2]) parsedLines.push(crewMatch[2]);
          if (crewMatch[3]) parsedLines.push(crewMatch[3]);
          parsedLines.push(crewMatch[4]);
          parsedLines.push(crewMatch[5]);
          continue;
      }
      
      parsedLines.push(trimmed);
  }
  return parsedLines;
}

export function parseDetailedSchedule(text: string) {
  const flightsDict: Record<string, any> = {};
  const lines = normalizeDetailedText(text);

  let currentKey = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Flight or SIM check
    if (/^[A-Z0-9]{2,8}$/.test(line) && i + 4 < lines.length) {
      const flt = line;
      const dep = lines[i + 1];
      const stdStr = lines[i + 2];
      const arr = lines[i + 3];
      const staStr = lines[i + 4];

      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(stdStr) && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(staStr)) {
        const stdUtc = getUtcTime(stdStr, dep);
        const staUtc = getUtcTime(staStr, arr);
        let ac = "";
        let idx = i + 5;
        const ranks = ['CAP', 'FO', 'FS', 'CS', 'SS', 'PUR', 'INT', 'CC'];

        if (idx < lines.length && !ranks.includes(lines[idx])) {
          ac = lines[idx];
          i = idx + 1;
        } else {
          i = idx;
        }

        const key = `${flt}_${stdStr}`;
        if (!flightsDict[key]) {
          flightsDict[key] = {
            flt, dep, arr, stdStr, staStr, stdUtc, staUtc, ac, crews: []
          };
        }
        currentKey = key;
        continue;
      }
    }

    if (currentKey) {
      const ranks = ['CAP', 'FO', 'FS', 'CS', 'SS', 'PUR', 'INT', 'CC'];
      if (ranks.includes(line)) {
        const rank = line;
        let idx = i + 1;
        let duty = "", pic = "", crewId = "";

        if (idx < lines.length && !/^\d{6,7}$/.test(lines[idx]) && !/^[A-Z]\d{6}$/.test(lines[idx])) {
          duty = lines[idx];
          idx++;
        }

        if (idx < lines.length && /^[PF]\d$/.test(lines[idx])) {
          pic = lines[idx];
          idx++;
        } else if (idx < lines.length && ['GDTVL', 'TVL'].includes(lines[idx])) {
          idx++;
        }

        if (idx < lines.length && (/^\d{6,7}$/.test(lines[idx]) || /^[A-Z]\d{6}$/.test(lines[idx]))) {
          crewId = lines[idx];
          idx++;
        }

        const name = idx < lines.length ? lines[idx] : "";
        idx++;

        let comment = "";
        if (idx < lines.length) {
          const nextLine = lines[idx];
          // Determine if nextLine is actual data or a comment
          // A flight number is typically KE887 or DH123 (2 letters + numbers).
          // Special codes like 787OE or 30MEARLY should NOT be caught by the flight pattern.
          const isFlightNum = /^[A-Z]{2}\d{1,4}[A-Z]?$/.test(nextLine);
          const isRank = ranks.includes(nextLine);
          const isDate = /^\d{4}-\d{2}-\d{2}/.test(nextLine);
          const isAirport = /^[A-Z]{3}$/.test(nextLine);
          const isHeader = nextLine.startsWith('Flight/Activity');

          if (!isRank && !isHeader && !isFlightNum && !isAirport && !isDate) {
            comment = nextLine;
            idx++;
          }
        }

        let infoStr = pic ? `${crewId}, ${rank}, ${pic}` : `${crewId}, ${rank}`;
        if (comment) infoStr += ` [${comment}]`;
        let crewStr = `${name} (${infoStr})`;
        if (duty === 'TVL') crewStr += " [TVL]";

        if (!flightsDict[currentKey].crews.includes(crewStr)) {
          flightsDict[currentKey].crews.push(crewStr);
        }

        i = idx;
        continue;
      }
    }
    i++;
  }

  return Object.values(flightsDict).sort((a: any, b: any) => {
    // For sorting, if standard UTC parsing fails, fallback to string comparison
    if (!a.stdUtc && !b.stdUtc) return a.stdStr.localeCompare(b.stdStr);
    if (!a.stdUtc) return -1;
    if (!b.stdUtc) return 1;
    
    // Convert both to their naive local timestamp value as parsed from the string
    // This guarantees that flight order matches the explicit written date (e.g. 21st 04:34 vs 21st 09:16)
    // circumventing timezone crossover bugs where a late time in UTC-8 drops a day earlier. 
    const aLocalMs = new Date(a.stdStr.replace(' ', 'T')).getTime();
    const bLocalMs = new Date(b.stdStr.replace(' ', 'T')).getTime();
    
    if (aLocalMs !== bLocalMs) return aLocalMs - bLocalMs;
    
    return a.stdUtc.getTime() - b.stdUtc.getTime();
  });
}

export function parseCalendarSchedule(text: string) {
  const events = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  let currentDay: number | null = null;
  for (const line of lines) {
    if (line.includes("Flight (FLY)") || line.includes("Copyright")) break;

    if (/^\d{2}$/.test(line)) {
      currentDay = parseInt(line, 10);
    } else if (currentDay !== null) {
      const upperLine = line.toUpperCase();
      if (upperLine.includes('RESERVE') || upperLine.includes('RSV')) {
        events.push({ type: "RSV", day: currentDay, text: "Reserve" });
      } else if (upperLine.includes('STBY')) {
        events.push({ type: "STBY", day: currentDay, text: upperLine });
      } else {
        const match = line.match(/([A-Za-z0-9_]+)?[A-Z]{3}\s+(\d{2}:\d{2})\s*-\s*[A-Z]{3}\s+(\d{2}:\d{2})/);
        if (match) {
          const subject = match[1] ? match[1] : "Training";
          const startTime = match[2];
          const endTime = match[3];

          if (!/^KE\d+/.test(subject) && !/^DH\d+/.test(subject)) {
            events.push({
              type: "TRG",
              day: currentDay,
              text: `${subject} ${startTime}~${endTime}`,
              subject,
              start: startTime,
              end: endTime
            });
          }
        }
      }
    }
  }
  return events;
}

export function generateEvents(sortedFlights: any[], calEvents: any[], isCap: boolean) {
  let perDiemTotal = { usd: 0, eur: 0 };
  let flightsCount = 0;
  let totalFlightTimeMs = 0;
  
  // Base date reference from flights, or fallback to now
  let baseDate = sortedFlights.length > 0 && sortedFlights[0].stdUtc ? sortedFlights[0].stdUtc : new Date();
  
  const rots: any[] = [];
  let t_rot: any[] = [];

  for (const f of sortedFlights) {
    if (['ICN', 'GMP'].includes(f.dep) && t_rot.length > 0) {
      rots.push(t_rot);
      t_rot = [];
    }
    t_rot.push(f);
    if (['ICN', 'GMP'].includes(f.arr)) {
      rots.push(t_rot);
      t_rot = [];
    }
  }
  if (t_rot.length > 0) rots.push(t_rot);

  const payloadEvents: any[] = [];

  // 1. Add Flights
  for (const r of rots) {
    const f1 = r[0];
    const fL = r[r.length - 1];
    flightsCount += r.length;

    const isSim = SIM_KEYWORDS.some(k => f1.flt.toUpperCase().includes(k));
    let subject = isSim ? `${f1.flt}, ${f1.dep} ${f1.stdStr.substring(11)}~${fL.staStr.substring(11)}`
                        : `${f1.flt}, ${f1.dep} ${f1.stdStr.substring(11)} ${r.map((x: any)=>x.arr).join(',')} ${fL.staStr.substring(11)}`;

    // -----------------------------------------------------------------
    // Reconstruction of the exact V2 Python logic for the description
    // -----------------------------------------------------------------
    const memo: string[] = [];
    
    let showUpDt = null;
    let startDtObj = f1.stdUtc ? f1.stdUtc : new Date(); 
    
    if (f1.stdUtc) {
      // V2 Python script calculates Show Up based on "kst" and offset
      // Assuming offset is 1h 35m for ICN and 1h 40m for others based on start time
      const offsetMs = f1.dep === 'ICN' ? (95 * 60000) : (100 * 60000);
      showUpDt = new Date(f1.stdUtc.getTime() - offsetMs);
    }

    let totalBlockSeconds = 0;
    for (const f of r) {
      if (f.staUtc && f.stdUtc) {
        totalBlockSeconds += (f.staUtc.getTime() - f.stdUtc.getTime()) / 1000;
      }
    }

    for (let i = 0; i < r.length; i++) {
        const f = r[i];
        
        memo.push(`✈️ ${f.dep}-${f.arr} ✈️`);

        if (i === 0 && !isSim && showUpDt) {
            // Need a naive KST format since Python used KST string: YYYY-MM-DD HH:MM
            // We'll construct a +9h shifted string relative to UTC
            const kstDt = new Date(showUpDt.getTime() + 9 * 3600000);
            const kstStr = kstDt.toISOString().replace('T', ' ').substring(0, 16);
            memo.push(`${f.dep} Show Up : ${kstStr} (KST)`);
        }

        let blkDur = "N/A";
        // Calculate flight time for this leg
        if (f.staUtc && f.stdUtc) {
          const legTimeMs = f.staUtc.getTime() - f.stdUtc.getTime();
          blkDur = formatDuration(legTimeMs);
          if (legTimeMs > 0 && !isSim) {
            totalFlightTimeMs += legTimeMs;
          }
        }
        
        const stdUtcStr = f.stdUtc ? f.stdUtc.toISOString().substring(11, 16) : "?";
        const staUtcStr = f.staUtc ? f.staUtc.toISOString().substring(11, 16) : "?";
        
        memo.push(`${f.flt}: ${f.stdStr} (UTC ${stdUtcStr})`);
        if (f.ac) {
            memo.push(`-> ${f.staStr} (UTC ${staUtcStr}) (A/C: ${f.ac})`);
        } else {
            memo.push(`-> ${f.staStr} (UTC ${staUtcStr})`);
        }
        memo.push(`Block Time : ${blkDur}`);

        // Per diem calculation matches python logic exactly
        if (i < r.length - 1) {
            const next_f = r[i+1];
            if (next_f.stdUtc && f.staUtc) {
                const stayDiffMs = next_f.stdUtc.getTime() - f.staUtc.getTime();
                const stayH = stayDiffMs / 3600000;
                const isDom = KOREA_PORTS.includes(f.dep) && KOREA_PORTS.includes(f.arr);
                
                if (isDom) {
                    const domPay = isCap ? 26000 : 20000;
                    memo.push(`Domestic Stay : ${formatDuration(stayDiffMs)} (Allowance : ${domPay.toLocaleString()} KRW)`);
                } else {
                    if (stayH < 4) {
                        const total_h = totalBlockSeconds / 3600;
                        let pdVal = 35;
                        if (isCap && total_h >= 5) pdVal = 60;
                        else if (isCap) pdVal = 50;
                        else if (total_h >= 5) pdVal = 41;
                        
                        memo.push(`Quick Turn (Per Diem : $${pdVal.toFixed(2)})`);
                        perDiemTotal.usd += pdVal;
                    } else {
                        const { rate, currency } = getRateInfo(f.arr);
                        const pdVal = stayH * rate;
                        memo.push(`Stay Hours : ${formatDuration(stayDiffMs)} (Per Diem : ${pdVal.toFixed(2)} ${currency})`);
                        if (currency === "€") {
                            perDiemTotal.eur += pdVal;
                        } else {
                            perDiemTotal.usd += pdVal;
                        }
                    }
                }
            }
        }

        memo.push(`★ ${f.flt} Crew ★`);
        if (f.crews) {
            memo.push(...f.crews);
        }
        memo.push("");
    }

    const detailedDesc = memo.join("\n").trim();
    // -----------------------------------------------------------------
    
    let endDtObj = fL.staUtc;
    if (!endDtObj) {
      endDtObj = new Date(startDtObj.getTime() + 10 * 3600000);
    }
    
    payloadEvents.push({
      summary: subject,
      description: detailedDesc.trim(),
      location: `${f1.dep} -> ${fL.arr}`,
      start: { dateTime: startDtObj.toISOString() },
      end: { dateTime: endDtObj.toISOString() },
      type: 'FLT'
    });
  }

  // 2. Add Calendar Events (RSV, STBY, TRG (PC/PT/GND))
  // Filter out days that already have flights to avoid duplicating SIM dates as both TRG and FLT
  const flightDays = new Set(sortedFlights.map(f => {
    if (!f.stdUtc) return -1;
    const kstDt = new Date(f.stdUtc.getTime() + 9 * 3600000);
    return kstDt.getUTCDate();
  }));

  for (const cev of calEvents) {
    const day = cev.day;
    if (flightDays.has(day) && !['RSV', 'STBY'].includes(cev.type)) continue;

    const kstBaseDate = new Date(baseDate.getTime() + 9 * 3600000);
    const yyyy = kstBaseDate.getUTCFullYear();
    const mm = kstBaseDate.getUTCMonth();

    let startHour = 0; let startMin = 0;
    let endHour = 0; let endMin = 0;

    let summary = "";
    let location = "ICN";

    if (cev.type === 'RSV') {
      startHour = 0; startMin = 0;
      endHour = 23; endMin = 59;
      summary = "RESERVE";
    } else if (cev.type === 'STBY') {
      // Default 09:00 to 15:00 if no specific time matched
      startHour = 9; startMin = 0;
      endHour = 15; endMin = 0;
      const timeMatch = cev.text.match(/(\d{4})/);
      if (timeMatch) {
        startHour = parseInt(timeMatch[1].substring(0, 2), 10);
        startMin = parseInt(timeMatch[1].substring(2, 4), 10);
        endHour = startHour + 6; // 6 hours assumed
        endMin = startMin;
      }
      summary = "STANDBY";
    } else if (cev.type === 'TRG') {
      const [hh_s, mm_s] = cev.start.split(':').map(Number);
      const [hh_e, mm_e] = cev.end.split(':').map(Number);
      startHour = hh_s; startMin = mm_s;
      endHour = hh_e; endMin = mm_e;
      summary = `TRG: ${cev.subject}`;
    }

    const startUtcTime = Date.UTC(yyyy, mm, day, startHour, startMin) - 9 * 3600000;
    let endUtcTime = Date.UTC(yyyy, mm, day, endHour, endMin) - 9 * 3600000;
    if (endUtcTime <= startUtcTime) {
      endUtcTime += 24 * 3600000;
    }

    const startDt = new Date(startUtcTime);
    const endDt = new Date(endUtcTime);

    payloadEvents.push({
      summary,
      description: `Schedule Type: ${cev.type} parsed from Calendar.`,
      location,
      start: { dateTime: startDt.toISOString(), timeZone: 'Asia/Seoul' },
      end: { dateTime: endDt.toISOString(), timeZone: 'Asia/Seoul' },
      type: cev.type
    });
  }

  // Sort payload by start date
  payloadEvents.sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime());

  return { events: payloadEvents, perDiemTotal, flightsCount, totalFlightTimeMs };
}
