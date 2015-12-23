package de.thomasjacob.mokkme.migration;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;


public class AccessLogMigrator
{
	private static Map<String, Integer> monthNameToNumber = new HashMap<String, Integer>();

	static
	{
		Calendar calendar = new GregorianCalendar(Locale.ENGLISH);
		SimpleDateFormat format = new SimpleDateFormat("MMM", Locale.ENGLISH);
		for (int i = 1; i <= 12; i++)
		{
			calendar.set(Calendar.MONTH, i - 1);
			monthNameToNumber.put(format.format(calendar.getTime()), i);
		}
	}

	public static void main(String[] args) throws Exception
	{
		Pattern pattern =
			Pattern
				.compile("^[^]]*\\[([0-9]{1,2})/([a-zA-Z]+)/([0-9]{4}):([0-9]{2}):([0-9]{2}):([0-9]{2}) [^]]*\\] \"([A-Z]+) /db/(e|v)/([^ ]+) .*$");

		FileInputStream fileInputStream = new FileInputStream(new File(args[0]));
		BufferedReader reader = new BufferedReader(new InputStreamReader(fileInputStream, "ISO-8859-1"));

		FileOutputStream fileOutputStream = new FileOutputStream(new File(args[1]));
		PrintWriter writer = new PrintWriter(new OutputStreamWriter(fileOutputStream, "ISO-8859-1"));

		String line;
		while ((line = reader.readLine()) != null)
		{
			Matcher matcher = pattern.matcher(line);
			if (matcher.matches())
			{
				try
				{
					int day = Integer.parseInt(matcher.group(1));
					int month = monthNameToNumber.get(matcher.group(2));
					int year = Integer.parseInt(matcher.group(3));
					int hour = Integer.parseInt(matcher.group(4));
					int minute = Integer.parseInt(matcher.group(5));
					int second = Integer.parseInt(matcher.group(6));
					String date = String.format("%04d-%02d-%02d %02d:%02d:%02d", year, month, day, hour, minute, second);
					String method = matcher.group(7);
					String type = matcher.group(8);
					String id = matcher.group(9);

					if (StringUtils.equals(method, "GET") && StringUtils.equals(type, "e"))
					{
						// writer.println("update Mock set viewDate = '" + date + "' where editId = '" + id
						// + "' and viewDate < '" + date + "';");
						// writer.println("update Mock set viewCount = viewCount + 1 where editId = '" + id + "';");
					}
					else if (StringUtils.equals(method, "GET") && StringUtils.equals(type, "v"))
					{
						// writer.println("update Mock set viewDate = '" + date + "' where viewId = '" + id
						// + "' and viewDate < '" + date + "';");
						// writer.println("update Mock set viewCount = viewCount + 1 where viewId = '" + id + "';");
					}
					else if (StringUtils.equals(method, "PUT") && StringUtils.equals(type, "e"))
					{
						writer.println("update Mock set creationDate = '" + date + "' where editId = '" + id
							+ "' and creationDate > '" + date + "';");
						// writer.println("update Mock set modificationDate = '" + date + "' where editId = '" + id
						// + "' and modificationDate < '" + date + "';");
						// writer.println("update Mock set editCount = editCount + 1 where editId = '" + id + "';");
					}
				}
				catch (Exception exception)
				{
					exception.printStackTrace(System.out);
				}
			}
		}

		IOUtils.closeQuietly(reader);
		IOUtils.closeQuietly(fileInputStream);

		writer.flush();
		fileOutputStream.flush();
		fileOutputStream.close();
		writer.close();
	}
}
