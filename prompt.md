# MASTER DEVELOPMENT PROMPT — NetResQ
## An Adaptive Self-Healing Network Using Quality-Aware Routing

You are acting as a senior full-stack developer, computer networks engineer, and technical mentor.

Build a complete, runnable college-level computer networks project named **NetResQ: An Adaptive Self-Healing Network Using Quality-Aware Routing**.

Do not stop after creating the UI, writing a plan, or generating placeholder files. Implement the application, connect the components, run it, test its main functionality, fix errors, and document how to demonstrate it.

The application must be understandable to a college student who needs to explain the implementation, algorithms, architecture, and test results to a project evaluator.

The goal is a working, technically honest, easy-to-demonstrate project rather than an unnecessarily complicated enterprise application.

---

# SECTION 1 — PROJECT BACKGROUND

1. The project domain is Computer Networks.
2. The main area is Software-Defined Networking (SDN).
3. The primary networking layer is OSI Layer 3.
4. The project name is NetResQ.
5. The main objective is adaptive, self-healing network routing.
6. Traditional shortest-path routing generally prioritizes a path's total configured cost or hop count without necessarily responding to changing link quality.
7. A link can fail completely, experience packet loss, become congested, or exhibit increased latency.
8. When a selected path becomes unavailable, the system should select an available alternate path automatically.
9. When a path degrades, the quality-aware algorithm should be able to prefer a healthier path when its calculated cost is lower.
10. The project must compare a conventional shortest-path baseline with the proposed quality-aware routing algorithm.
11. The system must display topology, link health, active routes, network events, and performance metrics.
12. The dashboard must make it easy to observe a failure and understand how the routing algorithm responds.
13. The application must distinguish simulated network behavior from measurements collected from an actual emulated network.
14. Do not claim that an SDN controller is connected unless the backend verifies that connection.
15. The final result must run locally and have clear setup instructions.

# SECTION 2 — TECHNOLOGY STACK

Use the following stack unless an environment incompatibility requires a documented alternative.

16. Frontend framework: React.
17. Frontend language: TypeScript.
18. Frontend build tool: Vite.
19. Styling: Tailwind CSS.
20. UI icons: Lucide React.
21. Network topology visualization: React Flow, using the currently compatible package and API.
22. Charts: Recharts.
23. HTTP communication: native fetch or a small reusable API client.
24. Backend language: Python 3.
25. Backend framework: FastAPI.
26. ASGI server: Uvicorn.
27. Graph model: NetworkX.
28. Baseline algorithm: Dijkstra shortest-path routing.
29. Proposed algorithm: weighted quality-aware shortest-path routing.
30. Real network emulation: Mininet.
31. Virtual switches: Open vSwitch.
32. SDN control: Ryu with OpenFlow 1.3, or a compatible alternative if justified by environment checks.
33. Traffic testing: ping and iperf3 when the real-network environment supports them.
34. Automated backend testing: pytest.
35. Frontend testing: Vitest and React Testing Library where practical.
36. Use REST APIs between React and FastAPI.
37. Use polling initially for live dashboard updates; implement WebSockets only if necessary and reliable.
38. Do not introduce a database, authentication service, container orchestration platform, or external cloud service unless genuinely needed.
39. Store configuration in readable Python modules or configuration files.
40. Keep dependencies limited and compatible.

# SECTION 3 — RESEARCH AND GITHUB REFERENCES

41. Inspect the reference repository: https://github.com/ascjreddy/sdn-controller
42. Study its documented LLDP discovery, topology graph, Dijkstra routing, host learning, failure recovery, and REST API concepts.
43. Inspect the reference repository: https://github.com/Srizzye/Self-Healing-Software-Defined-Networks
44. Study its documented approach to comparing static and adaptive routing under controlled failures.
45. Review relevant Mininet documentation: https://mininet.org/walkthrough/
46. Review Ryu documentation: https://ryu.readthedocs.io/en/latest/getting_started.html
47. Verify whether the reference repositories are accessible before relying on their implementation details.
48. Treat repository descriptions as guidance, not proof that every feature works in the current environment.
49. Do not copy an entire repository into this project.
50. Do not falsely attribute our implementation to either reference repository.
51. Implement a clearly structured solution suitable for explaining during a college demonstration.
52. Record the reference links and describe which architectural ideas informed the implementation in README.md.
53. Check dependency versions and operating-system requirements before choosing an integration approach.
54. If Ryu cannot be installed or run reliably, preserve the simulation mode and document the real-network limitation.
55. Do not silently replace actual SDN functionality with a frontend animation while claiming that real networking is working.

# SECTION 4 — DEVELOPMENT STRATEGY

56. Begin by inspecting the existing workspace and its files.
57. Determine the operating system, Python version, Node.js version, and package-manager availability.
58. Check whether Mininet, Open vSwitch, Ryu or OS-Ken, ping, and iperf3 are available.
59. Avoid overwriting existing user files without inspecting them.
60. Create a concise implementation plan and then start coding immediately.
61. Build a minimum viable end-to-end application before adding optional features.
62. Implement simulation mode first so that the core application works independently of SDN installation.
63. Keep the simulation and real-network integration behind a common backend interface.
64. Do not create two unrelated routing implementations with inconsistent behavior.
65. Implement routing logic in reusable Python functions.
66. Keep the React components focused on presentation and user interactions.
67. Put API calls in a dedicated frontend service layer.
68. Keep the topology data model consistent between frontend and backend.
69. Add useful error messages rather than allowing failures to produce a blank screen.
70. Run tests after meaningful implementation changes.
71. Never report a test as passed unless it was actually executed successfully.
72. Prioritize functional correctness, explainability, and a reliable demo over unnecessary animations or extra features.

# SECTION 5 — PROJECT DIRECTORY STRUCTURE

73. Create the following general structure:

    NetResQ/
      frontend/
        src/
          components/
          pages/
          hooks/
          services/
          types/
          utils/
          App.tsx
          main.tsx
          index.css
        package.json
        vite.config.ts
        tsconfig.json
      backend/
        app/
          main.py
          config.py
          models.py
          api/
            routes.py
          services/
            topology_service.py
            routing_service.py
            metrics_service.py
            simulation_service.py
            event_service.py
            controller_service.py
          algorithms/
            shortest_path.py
            quality_aware.py
          adapters/
            base.py
            simulation_adapter.py
            mininet_adapter.py
            sdn_controller_adapter.py
          tests/
            test_shortest_path.py
            test_quality_aware.py
            test_failures.py
            test_api.py
        requirements.txt
      docs/
        architecture.md
        algorithm_explanation.md
        testing_guide.md
        viva_questions.md
      scripts/
        start_backend.sh
        start_frontend.sh
      .gitignore
      README.md

74. Adjust the structure when necessary, but maintain clear separation of responsibilities.
75. Every important source file must contain real implementation logic.
76. Avoid creating multiple empty files merely to make the project appear larger.
77. Keep package scripts, dependency files, and startup commands consistent with the actual implementation.
78. Add Windows-friendly instructions where practical and Ubuntu instructions for networking components.
79. Do not assume shell scripts work directly in Windows PowerShell.
80. Keep real-network commands separate from ordinary application startup commands.

# SECTION 6 — FRONTEND DESIGN

81. Build the frontend using React and TypeScript.
82. Use a professional network operations dashboard aesthetic.
83. Use a dark navy or charcoal background with restrained blue and cyan accents.
84. Use green to indicate healthy links, amber for degraded links, and red for failed links.
85. Maintain readable text contrast and clear visual hierarchy.
86. Avoid excessive gradients, glowing cards, random floating elements, and unnecessary animation.
87. Avoid generic landing-page layouts that do not resemble a network monitoring tool.
88. Use a consistent spacing scale, typography system, border radius, and card styling.
89. Use Lucide React icons for consistent iconography.
90. Ensure the application fits common laptop screen sizes.
91. Make the dashboard usable at narrower widths without breaking its main controls.
92. Include clear loading, empty, success, warning, and error states.
93. Use realistic labels such as Switches Online, Healthy Links, Active Route, and Recovery Events.
94. Use meaningful network terminology throughout the interface.
95. Do not use fake customer names, invented company branding, or irrelevant marketing sections.
96. Avoid unnecessary login pages because authentication is outside the project's scope.
97. Make the dashboard the default landing page.
98. Include a compact NetResQ logo or wordmark created from ordinary UI elements.
99. Display the selected operating mode clearly.
100. Show whether the backend is connected and when the last successful refresh occurred.
101. Make every visible interactive control perform a real action.
102. Do not leave buttons that only change their labels without changing the application's state.
103. Use reusable components rather than a single oversized JSX file.
104. Keep the UI clean enough that a student can explain the component structure.

# SECTION 7 — REQUIRED DASHBOARD LAYOUT

105. Create a persistent application header.
106. Show the NetResQ name and the subtitle "Adaptive Self-Healing Network".
107. Include a backend connectivity indicator.
108. Include a mode selector for Simulation and Real SDN when available.
109. Display the current routing algorithm.
110. Include a reset-demo control with a confirmation step.
111. Add a left navigation menu or compact navigation tabs.
112. Provide Overview, Network Topology, Routing Analysis, Events, and Settings sections.
113. Avoid creating unnecessary pages that duplicate the same information.
114. On the overview page, show four to six useful metric cards.
115. Include switch count, link count, failed links, active route, average latency, and packet loss where data is available.
116. Show an interactive network topology as the primary dashboard visualization.
117. Show a routing comparison panel for baseline and quality-aware routing.
118. Include a recent-events panel with timestamps and event severity.
119. Include a compact performance chart showing latency or packet loss over time.
120. Add clear controls for link failure, link recovery, congestion, and restoration of the default scenario.
121. Provide source and destination selectors for route inspection.
122. Display the chosen path as an ordered list of switches.
123. Show the calculated path cost and relevant per-link metrics.
124. Show a helpful message when no valid route exists.
125. Include tooltips or concise explanatory text for unfamiliar networking concepts.
126. Keep the main topology visible without requiring the user to scroll through large decorative sections.

# SECTION 8 — NETWORK TOPOLOGY VISUALIZATION

127. Implement the topology using React Flow.
128. Represent switches as visually distinct nodes.
129. Represent hosts as separate endpoint nodes.
130. Represent links as edges between the correct endpoints.
131. Provide a deterministic default topology.
132. Use three switches connected in a triangle.
133. Attach hosts to switches so that end-to-end routes can be demonstrated.
134. Ensure the triangle provides an alternate path when any one inter-switch link fails.
135. Use stable identifiers for all nodes and links.
136. Store node positions in topology data or a dedicated layout configuration.
137. Avoid random node positions on every refresh.
138. Label switches with names such as S1, S2, and S3.
139. Label hosts with names such as H1, H2, H3, and H4.
140. Display link identifiers, latency, packet loss, and utilization when appropriate.
141. Use edge styling to indicate healthy, degraded, and failed links.
142. Use an additional visual treatment to highlight the active route.
143. Distinguish the baseline route from the quality-aware route.
144. Keep the topology understandable when routes overlap.
145. Add a small legend explaining the colors and line styles.
146. Provide fit-to-view and reset-layout controls.
147. Allow users to select a node or link to inspect its details.
148. Display selected-link metrics in a detail panel or popover.
149. Do not allow a failed link to appear as a valid active forwarding path.
150. If a link is down, visually communicate its failure even when the graph contains other healthy routes.
151. Update the topology after a successful backend state change.
152. Do not use random frontend-only failure states that contradict backend routing decisions.
153. Use backend topology state as the source of truth.
154. Ensure the topology remains readable with different window sizes.

# SECTION 9 — DATA MODELS AND NETWORK GRAPH

155. Model switches and hosts as nodes and network connections as edges.
156. Each node must have a stable ID and node type.
157. Each link must have a stable ID and endpoint identifiers.
158. Include a link-up or link-down state.
159. Store latency in milliseconds.
160. Store packet loss as a percentage between zero and one hundred.
161. Store utilization as a percentage between zero and one hundred.
162. Store throughput when available.
163. Include a base administrative or configured cost for each link.
164. Validate metric ranges before using them in routing calculations.
165. Exclude failed links from path calculations.
166. Avoid mutating shared topology data unexpectedly.
167. Use a NetworkX graph for backend routing.
168. Use a deterministic sample topology for reproducible tests.
169. Return a clear error when a requested source or destination does not exist.
170. Return a clear no-path result when the graph is disconnected.
171. Keep serialization between NetworkX and JSON explicit.
172. Ensure graph updates are reflected in subsequent route calculations.
173. Avoid assuming that a visually connected frontend graph proves physical connectivity.
174. In real SDN mode, distinguish discovered topology from the predefined simulation topology.

# SECTION 10 — SHORTEST-PATH BASELINE

175. Implement the baseline using NetworkX shortest-path functionality and Dijkstra's algorithm.
176. Make the baseline's edge-weight definition explicit.
177. For the simplest baseline, use a configured hop cost of one per usable inter-switch link.
178. If the route includes host attachment edges, define their treatment consistently.
179. Exclude links marked down.
180. Compute routes using the current topology state.
181. Return the ordered path, total hop cost, and link sequence.
182. Handle missing nodes and disconnected paths gracefully.
183. Add unit tests for a direct path, a multihop path, and an unreachable destination.
184. Do not label a path "shortest" without specifying the cost being minimized.
185. Keep the baseline independent from the quality-aware metric weights.

# SECTION 11 — QUALITY-AWARE ROUTING ALGORITHM

186. Implement a weighted cost for each usable link.
187. The cost must incorporate configured cost, latency, packet loss, and utilization.
188. Provide editable weights in the settings page.
189. Use a documented, mathematically consistent cost formula.
190. Normalize latency using a configurable reference latency.
191. Convert packet loss percentage into a normalized value between zero and one.
192. Normalize utilization percentage into a value between zero and one.
193. Use nonnegative edge costs so Dijkstra's algorithm remains appropriate.
194. Suggested initial formula:

    normalized_latency = latency_ms / latency_reference_ms

    normalized_loss = packet_loss_percent / 100

    normalized_utilization = utilization_percent / 100

    link_cost = (
        configured_cost_weight * configured_cost
        + latency_weight * normalized_latency
        + loss_weight * normalized_loss
        + utilization_weight * normalized_utilization
    )

195. Document the units and meaning of every parameter.
196. Make the latency reference configurable, with a sensible positive default.
197. Validate that the weights are nonnegative and that their combined configuration is meaningful.
198. Do not silently compare raw milliseconds, percentages, and arbitrary costs without normalization.
199. Use a single, reusable function to calculate link costs.
200. Use the same cost function for route computation, route explanations, and tests.
201. Compute the lowest-total-cost path using Dijkstra's algorithm.
202. Exclude failed links before route calculation.
203. Avoid selecting a path that contains a failed link.
204. Explain why the selected path was preferred.
205. Show per-link costs and the total route cost.
206. Show the configured weights in the routing analysis panel.
207. If two routes have identical costs, use a deterministic tie-breaking rule.
208. Prevent zero or invalid reference values from causing division errors.
209. Handle high packet loss and high utilization consistently.
210. Include unit tests proving that a healthy alternate path can beat a degraded direct path.
211. Include a test showing that a failed edge is never selected.
212. Include a test showing that changing metric weights can change the selected path when the costs warrant it.
213. Explain that quality-aware routing is an optimization based on the selected formula, not an automatic guarantee of better real-world performance.
214. Make the algorithm straightforward enough to explain with a small graph and a few numerical examples.

# SECTION 12 — AUTOMATIC FAILOVER AND RECOVERY

215. Implement link failure simulation in the backend.
216. When a user fails a link, update its state in the authoritative topology.
217. Record the time at which the simulated failure begins.
218. Recalculate the active route using the selected routing algorithm.
219. If an alternate route exists, return it as the new active route.
220. Record the previous path and replacement path.
221. Record the failure event and route-recalculation event.
222. Measure software-level route-recalculation time using a monotonic clock.
223. Label this metric "route computation time" or "simulated recovery time" as appropriate.
224. Do not describe software calculation time as actual packet-level recovery time.
225. If no route exists, report the network partition or unreachable destination.
226. Keep the UI consistent with the backend state throughout the transition.
227. Add a control to restore a failed link.
228. On restoration, mark the link healthy and recalculate routes when appropriate.
229. Do not automatically claim that the original route is always optimal after recovery.
230. Record timestamps for all relevant events.
231. Avoid duplicate events caused by repeated polling.
232. Include a safe reset operation that restores the default topology and metrics.
233. Preserve the active mode during reset unless the user explicitly requests a mode change.
234. Include tests for failure, alternate-path selection, restoration, and network partition.
235. Ensure repeated failures and recoveries do not corrupt the graph.

# SECTION 13 — CONGESTION AND LINK DEGRADATION

236. Allow users to select a healthy link and increase its simulated utilization.
237. Allow latency to be increased within a documented range.
238. Allow packet loss to be changed within valid percentage bounds.
239. Provide a simple congestion preset for the demonstration.
240. Recalculate quality-aware routes after metric changes.
241. Compare the new quality-aware route with the baseline route.
242. Update link colors and displayed metrics.
243. Explain whether the selected route changed because of congestion, latency, packet loss, or failure.
244. Do not force the route to change when the calculated costs do not justify a change.
245. Provide a control to restore the original link metrics.
246. Make metric changes reproducible for testing.
247. Separate simulated metric values from measured traffic statistics.
248. Do not imply that changing a simulated utilization slider generates real network traffic.

# SECTION 14 — BACKEND API

249. Implement the backend using FastAPI.
250. Add a GET /api/health endpoint.
251. Add a GET /api/status endpoint.
252. Add a GET /api/topology endpoint.
253. Add a GET /api/metrics endpoint.
254. Add a GET /api/events endpoint.
255. Add a GET /api/routes endpoint.
256. Add a POST /api/routes/compute endpoint.
257. Add a POST /api/links/{link_id}/fail endpoint.
258. Add a POST /api/links/{link_id}/restore endpoint.
259. Add a POST /api/links/{link_id}/metrics endpoint.
260. Add a POST /api/simulation/reset endpoint.
261. Add endpoints for reading and updating routing weights.
262. Add a GET /api/comparison endpoint.
263. Add an endpoint that reports real-controller connection status.
264. Keep endpoint naming and request methods consistent.
265. Use Pydantic models for request validation.
266. Return appropriate HTTP status codes.
267. Return structured JSON errors.
268. Validate IDs and metric ranges before modifying state.
269. Prevent malformed input from crashing the backend.
270. Add CORS configuration restricted to the local frontend origin during development.
271. Do not enable unrestricted CORS in a production configuration.
272. Keep API business logic outside the route handlers.
273. Make API responses consistent and documented.
274. Include example requests and responses in the README.
275. Add automated tests for the most important endpoints.
276. Make health checks reflect actual backend readiness.
277. Do not report a real controller as connected simply because FastAPI is running.

# SECTION 15 — FRONTEND AND BACKEND INTEGRATION

278. Create a typed frontend API service.
279. Define TypeScript interfaces for nodes, links, metrics, routes, events, and API errors.
280. Fetch the initial topology from the backend.
281. Fetch the initial metrics and active route.
282. Update the dashboard when users perform simulation actions.
283. Poll for backend changes at a reasonable interval when live updates are needed.
284. Stop unnecessary polling when components unmount.
285. Avoid launching duplicate overlapping requests.
286. Show a loading indicator while the initial data is being fetched.
287. Display an error banner when the backend is unavailable.
288. Provide a retry option.
289. Keep controls disabled when the requested operation cannot be performed.
290. Prevent duplicate submissions during a pending operation.
291. Update the topology only after a successful backend response.
292. Refresh the affected metrics, routes, and events after state changes.
293. Avoid unnecessary full-page reloads.
294. Do not hardcode simulated API responses in the frontend.
295. All simulation logic must reside in the backend.
296. Ensure the interface remains useful when optional real-network integration is unavailable.

# SECTION 16 — PERFORMANCE COMPARISON

297. Compare baseline shortest-path routing and quality-aware routing under the same topology conditions.
298. Display both selected paths.
299. Display their respective hop counts.
300. Display the baseline path cost and quality-aware path cost with clear labels.
301. Display average latency when actual measurements or clearly identified simulated values are available.
302. Display packet loss when actual measurements or clearly identified simulated values are available.
303. Display throughput only when a valid measurement or explicitly labelled simulation estimate exists.
304. Display route-computation time.
305. Display simulated recovery time separately from actual observed traffic recovery time.
306. Use a bar chart for selected comparison metrics.
307. Use a line chart for metrics recorded over time.
308. Provide labels, units, legends, and useful tooltips.
309. Make it clear which routing algorithm produced each value.
310. Keep comparison conditions consistent between algorithms.
311. Provide a way to trigger the same failure scenario for both routing approaches.
312. Avoid reporting incomparable measurements as if they were collected under identical conditions.
313. Use recorded observations for real experimental charts.
314. Clearly label synthetic demonstration values as simulated.
315. Do not hardcode a claimed performance improvement.
316. Do not fabricate measured recovery times, throughput, latency, or packet-loss results.
317. If a metric has not been measured, display "Not measured" instead of inventing a value.
318. Explain the limitations of the comparison in the documentation.

# SECTION 17 — EVENTS AND LOGGING

319. Maintain a backend event log.
320. Record link failures.
321. Record link restorations.
322. Record congestion and metric changes.
323. Record route computations.
324. Record successful rerouting.
325. Record unreachable destinations.
326. Record controller connection and disconnection events when supported.
327. Include event type, timestamp, severity, and a human-readable message.
328. Display recent events in reverse chronological order.
329. Use distinct visual treatments for informational, warning, and error events.
330. Include a way to clear the displayed event history if appropriate.
331. Do not erase the underlying state accidentally when clearing presentation-only history.
332. Keep event messages concise and understandable.
333. Avoid logging secrets or unnecessary environment information.
334. Log exceptions on the backend with enough context to debug them.
335. Do not expose full internal stack traces to the frontend.

# SECTION 18 — REAL SDN INTEGRATION

336. Keep the real SDN implementation separate from simulation mode.
337. Use Mininet and Open vSwitch when available.
338. Configure OpenFlow 1.3 where supported.
339. Inspect the installed Python and controller versions before selecting a Ryu or OS-Ken integration.
340. Verify the controller can actually start before attempting live integration.
341. Verify that switches can connect to the controller.
342. Discover topology using LLDP when supported by the controller implementation.
343. Handle switch and port-status events.
344. Update the topology graph when a link is discovered or removed.
345. Implement real path selection in the controller where feasible.
346. Install forwarding rules using the selected path when the controller integration is enabled.
347. Ensure forwarding rules are consistent with the actual switch ports and topology.
348. Do not assume NetworkX path computation alone installs real OpenFlow rules.
349. Distinguish topology discovery, route calculation, flow installation, and traffic verification as separate steps.
350. Handle controller disconnection gracefully.
351. Do not run privileged Mininet commands automatically without explicit user approval.
352. Provide exact manual commands for starting the controller and emulated network.
353. Provide a repeatable test for link failure and restoration.
354. Verify connectivity using ping when the environment supports it.
355. Use iperf3 for throughput tests where practical.
356. Use LLDP timeout or an equivalent documented mechanism for silent failures if implemented.
357. Do not claim silent-failure detection unless it has actually been implemented and tested.
358. Avoid implementing every advanced SDN feature at the expense of a working prototype.
359. If real SDN integration cannot be verified, clearly mark it unavailable and retain a functional simulation.
360. Do not label a simulation result as an OpenFlow experiment.

# SECTION 19 — SIMULATION MODE

361. Simulation mode must be the default when no verified real-network controller is available.
362. It must work without Mininet, Open vSwitch, or privileged operating-system commands.
363. It must use the same routing functions as the rest of the backend.
364. It must provide the default triangle topology and connected hosts.
365. It must support link failure and recovery.
366. It must support metric adjustments and congestion scenarios.
367. It must support both routing algorithms.
368. It must provide repeatable state transitions.
369. It must update the topology and active route consistently.
370. It must generate events from actual backend operations.
371. It must support route inspection between selectable endpoints.
372. It must handle disconnected network partitions.
373. It must support resetting the scenario.
374. It must not depend on a pre-recorded animation to simulate rerouting.
375. It must remain fully demonstrable if real SDN setup is unavailable.
376. Clearly mark every simulation-only metric in the UI.

# SECTION 20 — TESTING REQUIREMENTS

377. Write unit tests for the baseline routing algorithm.
378. Write unit tests for the quality-aware cost calculation.
379. Test that failed links are excluded.
380. Test that alternate routes are selected when available.
381. Test that disconnected destinations return a valid no-path result.
382. Test that metric updates affect calculated costs.
383. Test that weight validation rejects invalid values.
384. Test that restoring a link updates topology state.
385. Test that repeated failures do not corrupt the graph.
386. Test the API health endpoint.
387. Test topology retrieval.
388. Test route computation through the API.
389. Test failure and restoration endpoints.
390. Test invalid link IDs and invalid metric values.
391. Test that the frontend displays backend errors properly.
392. Test the primary dashboard interactions.
393. Run all available automated tests.
394. Fix failures caused by the implementation.
395. Report any tests that could not be executed because dependencies are unavailable.
396. Never fabricate test output or test coverage.
397. Include a manual test checklist in the documentation.
398. Verify that a single failed inter-switch link results in an alternate path in the default topology.
399. Verify that the route avoids a failed link.
400. Verify that a disconnected topology produces a meaningful error state.
401. Verify that the reset operation restores the initial scenario.
402. Verify that the comparison panel uses the correct route and metric data.

# SECTION 21 — SECURITY AND ROBUSTNESS

403. Keep the application local by default.
404. Do not expose controller administration endpoints to an untrusted network.
405. Restrict development CORS to the frontend origin.
406. Validate every user-controlled parameter.
407. Never execute arbitrary shell commands constructed from frontend input.
408. Use explicit allowlisted operations for network actions.
409. Separate ordinary simulation requests from privileged system commands.
410. Require explicit human approval before running privileged network setup or teardown commands.
411. Keep credentials out of source code.
412. Do not add unnecessary secrets or API keys.
413. Handle API timeouts and controller failures.
414. Prevent invalid values from entering the graph.
415. Handle unexpected backend errors without crashing the dashboard.
416. Avoid infinite polling and uncontrolled background loops.
417. Ensure reset and restoration operations leave the simulation in a consistent state.

# SECTION 22 — CODE QUALITY AND EXPLAINABILITY

418. Write clear, readable Python and TypeScript.
419. Use meaningful function and variable names.
420. Keep functions focused on one responsibility.
421. Prefer straightforward implementations over clever abstractions.
422. Avoid excessively long files.
423. Avoid deeply nested conditionals when simpler control flow works.
424. Add type annotations to important Python functions.
425. Use TypeScript types rather than unnecessary any declarations.
426. Add comments explaining why an important networking decision is made.
427. Do not comment on every obvious line.
428. Explain the quality-aware routing formula beside its implementation.
429. Explain graph construction and edge filtering.
430. Explain how failure detection triggers route recomputation.
431. Explain the distinction between simulation and real network integration.
432. Explain why Dijkstra's algorithm is appropriate for nonnegative edge costs.
433. Avoid unnecessary design patterns and excessive dependency injection.
434. Do not add placeholder implementations for required features.
435. Remove unused imports, dead code, and debug statements.
436. Keep configuration separate from core algorithm logic.
437. Make test cases small enough to understand without advanced networking knowledge.
438. Ensure that a student can trace a route computation from input topology to returned path.
439. Provide a short explanation for every major module in the documentation.
440. Keep code behavior consistent with the documented algorithm.

# SECTION 23 — README AND ACADEMIC DOCUMENTATION

441. Write a complete README.md.
442. Include the project title and a concise project overview.
443. Include the problem statement.
444. Include the objectives from the project proposal.
445. Describe the proposed system.
446. List the technology stack.
447. Explain the overall architecture.
448. Explain how the React frontend communicates with FastAPI.
449. Explain the NetworkX graph model.
450. Explain baseline Dijkstra routing.
451. Explain the quality-aware edge-cost formula.
452. Include a small numerical example showing why one path can be preferred over another.
453. Explain failure detection and route recomputation.
454. Explain simulation mode and real SDN mode.
455. Include the directory structure.
456. Document environment prerequisites.
457. Document backend installation.
458. Document frontend installation.
459. Provide exact commands for running both services.
460. Document the API endpoints.
461. Explain how to trigger a link failure.
462. Explain how to trigger congestion.
463. Explain how to restore the default topology.
464. Document how to run automated tests.
465. Document optional Mininet setup.
466. Document optional controller setup.
467. Include expected observations, not invented benchmark results.
468. Include limitations and known compatibility issues.
469. Cite the GitHub reference repositories.
470. Clearly distinguish implemented functionality from planned or unavailable functionality.
471. Include a manual demo procedure suitable for a project presentation.
472. Use straightforward, natural technical writing rather than generic promotional claims.
473. Do not invent citations, research findings, experimental results, or external validation.

# SECTION 24 — ARCHITECTURE AND ALGORITHM DOCUMENTATION

474. Create docs/architecture.md.
475. Describe the frontend, backend, routing engine, and optional SDN controller.
476. Include a Mermaid architecture diagram.
477. Show the flow from user action to API request to graph update to route computation to UI refresh.
478. Explain which component owns network state.
479. Create docs/algorithm_explanation.md.
480. Explain Dijkstra routing with a small example.
481. Explain the normalized weighted edge-cost formula.
482. Explain how failed edges are excluded.
483. Explain how the best alternate path is selected.
484. Explain why changing weights may change the preferred path.
485. Explain what the algorithm does when no alternate route exists.
486. Create docs/testing_guide.md.
487. Document automated tests and manual verification steps.
488. Create docs/viva_questions.md.
489. Include likely project-evaluation questions and concise, accurate answers.
490. Cover SDN, OpenFlow, LLDP, Mininet, NetworkX, Dijkstra, FastAPI, quality-aware routing, failover, and limitations.
491. Keep every explanation consistent with the actual implementation.

# SECTION 25 — EXPECTED DEMONSTRATION SCENARIO

492. Start with a healthy three-switch triangle topology.
493. Display hosts H1, H2, H3, and H4 attached to the switches.
494. Select a source and destination that have more than one possible route.
495. Compute the baseline shortest path.
496. Compute the quality-aware path.
497. Display both paths and their calculated costs.
498. Demonstrate a healthy network before a failure.
499. Select an inter-switch link and trigger a failure.
500. Show the link changing to a failed state.
501. Show a failure event in the event log.
502. Recalculate the baseline route.
503. Recalculate the quality-aware route.
504. Highlight the active alternate route.
505. Explain why the failed link is no longer used.
506. Restore the failed link.
507. Show the updated topology and recalculated route.
508. Increase utilization or latency on one healthy link.
509. Demonstrate how the quality-aware algorithm evaluates the changed metrics.
510. Compare both algorithms under the same simulated scenario.
511. Reset the topology and repeat the demonstration.
512. Make sure this complete demonstration works without real SDN dependencies.
513. If real SDN mode is available, document a separate demonstration using measured network traffic.
514. Clearly distinguish software-level simulated recovery from actual measured network recovery.

# SECTION 26 — FINAL ACCEPTANCE CRITERIA

515. The frontend starts successfully.
516. The backend starts successfully.
517. React can retrieve the backend health status.
518. The default topology loads without errors.
519. The baseline routing algorithm returns valid paths.
520. The quality-aware routing algorithm returns valid paths.
521. A failed link is excluded from both algorithms.
522. The application selects an alternate route when one exists.
523. Congestion and metric controls update backend state.
524. The dashboard reflects successful state changes.
525. The event log reflects the operations performed.
526. The comparison view uses real computed results.
527. Missing measurements are not fabricated.
528. Invalid inputs produce useful errors.
529. The reset operation works.
530. Automated tests run successfully where dependencies permit.
531. README instructions match the actual project.
532. The student can explain the core routing implementation.
533. Simulation mode works independently of real SDN installation.
534. Real-network capabilities are reported accurately.
535. No major dashboard control is left nonfunctional.
536. No critical runtime error remains knowingly unresolved.

# SECTION 27 — HOW TO EXECUTE THIS TASK

537. First inspect the environment and determine which features can run locally.
538. Then implement the backend models and graph algorithms.
539. Write and run the core algorithm tests.
540. Implement the FastAPI endpoints.
541. Test the backend independently before connecting the frontend.
542. Implement the React dashboard and topology visualization.
543. Connect the frontend to the actual backend endpoints.
544. Implement the failure, restoration, and congestion interactions.
545. Implement the metrics and comparison views.
546. Add the event log and error states.
547. Verify the complete simulation workflow.
548. Attempt real SDN integration only after the core application works.
549. Run the test suite and fix discovered implementation defects.
550. Review the README and setup commands against the actual workspace.
551. Provide a final summary of implemented features.
552. List exact commands needed to run the backend and frontend.
553. List tests that passed and tests that could not run.
554. List any remaining limitations honestly.
555. Explain the five most important files a student should understand before presenting the project.
556. Do not stop after generating a plan.
557. Do not claim completion before verifying the runnable application.
558. If the task is too large for one pass, finish the working minimum viable product first, then improve it incrementally.
559. Keep the implementation aligned with the supplied NetResQ project proposal.
560. Begin by inspecting the workspace, then implement the project.

**Final instruction:** Build a working, explainable NetResQ application with React as the frontend, Python/FastAPI as the backend, NetworkX for routing, and an optional real SDN integration. Prioritize correctness, reproducible demonstrations, readable code, and honest measurements. Do not substitute a static UI for the required functionality.